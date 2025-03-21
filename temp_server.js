const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const fs = require('fs');
const app = express();
const PORT = 3001; 

const resetCodes = new Map();
const testMode = true;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { mode: 0o777 });
} else {
    fs.chmodSync(uploadsDir, 0o755); // Update permissions to 0o755
}

console.log('Uploads directory status:', {
    path: uploadsDir,
    exists: fs.existsSync(uploadsDir),
    permissions: fs.statSync(uploadsDir).mode,
    isWritable: fs.accessSync(uploadsDir, fs.constants.W_OK)
});

let posts = [];
try {
    const postsData = fs.readFileSync('posts.json', 'utf8');
    posts = JSON.parse(postsData);
} catch (err) {
    console.log('No existing posts found, starting with empty array');
    posts = [];
}

const savePosts = () => {
    fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    const filePath = path.join(__dirname, 'public', req.url);
    console.log(`Full path: ${filePath}`);
    console.log(`File exists: ${require('fs').existsSync(filePath)}`);
    next();
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
            scriptSrcElem: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
            mediaSrc: ["'self'", "data:", "blob:", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
            connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
            fontSrc: ["'self'", "https://assets.ngrok.com"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            formAction: ["'self'", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 1000, 
    skip: (req) => process.env.NODE_ENV === 'development' 
});
app.use(limiter);

app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        if (req.path === '/api/posts') {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        return res.redirect('/login.html');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key'); // Use environment variable for secret
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            domain: 'localhost',
            path: '/'
        });
        if (req.path === '/api/posts') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.redirect('/login.html');
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        console.log('Multer saving file:', {
            originalName: file.originalname,
            fileName: file.fieldname,
            uploadPath: uploadPath,
            directoryExists: fs.existsSync(uploadPath),
            permissions: fs.statSync(uploadPath).mode
        });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, 
        files: 10 
    },
    fileFilter: (req, file, cb) => {
        console.log('Processing file in multer:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            encoding: file.encoding,
            destination: file.destination,
            filename: file.filename,
            path: file.path
        });

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];

        console.log('File type validation:', {
            isImage: allowedImageTypes.includes(file.mimetype),
            isVideo: allowedVideoTypes.includes(file.mimetype),
            fieldname: file.fieldname,
            mimetype: file.mimetype
        });

        if (file.fieldname === 'images' && !allowedImageTypes.includes(file.mimetype)) {
            console.error('Invalid image type:', file.mimetype);
            return cb(new Error(`Invalid image type: ${file.mimetype}. Allowed types: jpg, jpeg, png, gif`));
        }

        if (file.fieldname === 'videos' && !allowedVideoTypes.includes(file.mimetype)) {
            console.error('Invalid video type:', file.mimetype);
            return cb(new Error(`Invalid video type: ${file.mimetype}. Allowed types: mp4, webm, mov`));
        }

        console.log('File accepted:', file.originalname);
        cb(null, true);
    }
}).fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 5 }
]);

const uploadMiddleware = (req, res, next) => {
        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
        console.log('Multer error: ' + err.message);
                return res.status(400).json({
                    status: 'error',
                    message: `Upload error: ${err.message}`,
                    code: err.code
                });
            } else if (err) {
                log('Upload error: ' + err.message);
                return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
                    status: 'error',
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'File size exceeds the limit of 100MB.' 
                        : `Upload error: ${err.message}`,
                });
            }
            next();
    });
};

// Add the server listening code here
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
