const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/simple-wiki', { useNewUrlParser: true, useUnifiedTopology: true });

// User and Post Models
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
});

const PostSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).send({ message: 'Invalid token' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
};

// Routes
app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).send({ message: 'All fields are required' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        res.status(201).send({ message: 'User registered' });
    } catch (error) {
        res.status(500).send({ message: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ message: 'All fields are required' });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send({ message: 'Error logging in' });
    }
});

// Protected route to create a post
app.post('/posts', authenticateJWT, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).send({ message: 'Content is required' });
        }
        const newPost = new Post({ userId: req.user.id, content });
        await newPost.save();
        res.status(201).send({ message: 'Post created' });
    } catch (error) {
        res.status(500).send({ message: 'Error creating post' });
    }
});

// Get all posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).send({ message: 'Error getting posts' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});