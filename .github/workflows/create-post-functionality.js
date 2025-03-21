document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('postForm');
    const mediaInput = document.getElementById('media');
    const mediaPreview = document.getElementById('mediaPreview');
    const textError = document.getElementById('textError');
    const mediaError = document.getElementById('mediaError');

    // Handle file selection and preview
    mediaInput.addEventListener('change', function() {
        mediaPreview.innerHTML = '';
        mediaError.style.display = 'none';

        Array.from(this.files).forEach(file => {
            const reader = new FileReader();
            const previewElement = document.createElement(file.type.startsWith('video/') ? 'video' : 'img');
            
            if (file.type.startsWith('video/')) {
                previewElement.controls = true;
            }

            reader.onload = function(e) {
                previewElement.src = e.target.result;
                mediaPreview.appendChild(previewElement);
            };

            reader.readAsDataURL(file);
        });
    });
    
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous error messages
        textError.style.display = 'none';
        mediaError.style.display = 'none';
        
        // Disable submit button and show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Creating post...';
        
        const formData = new FormData();
        const text = document.getElementById('text').value;
        const mediaFiles = document.getElementById('media').files;
        
        // Add text content and hide username state
        formData.append('text', text);
        formData.append('hideUsername', document.getElementById('input').checked);
        
        try {
            
            // Add media files with validation
            const maxFileSize = 100 * 1024 * 1024; // 100MB
            const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];

            // Allow post with just text, but validate any uploaded files
            if (mediaFiles.length === 0 && !text.trim()) {
                throw new Error('Please enter some text or select media files');
            }

            console.log('Processing media files:', {
                count: mediaFiles.length,
                files: Array.from(mediaFiles).map(f => ({
                    name: f.name,
                    type: f.type,
                    size: f.size
                }))
            });

            for (let i = 0; i < mediaFiles.length; i++) {
                const file = mediaFiles[i];
                console.log('Processing file:', {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified
                });

                if (file.size > maxFileSize) {
                    throw new Error(`File ${file.name} exceeds the 100MB size limit`);
                }
                
                // Log type checking
                console.log('File type validation:', {
                    file: file.name,
                    type: file.type,
                    isImage: allowedImageTypes.includes(file.type),
                    isVideo: allowedVideoTypes.includes(file.type)
                });
                
                if (allowedImageTypes.includes(file.type)) {
                    formData.append('images', file);
                    console.log('Added as image:', file.name);
                } else if (allowedVideoTypes.includes(file.type)) {
                    formData.append('videos', file);
                    console.log('Added as video:', file.name);
                } else {
                    throw new Error(`Unsupported file type: ${file.type}. Allowed types: jpg, jpeg, png, gif, mp4, webm, mov, avi, mpeg`);
                }
            }

            // Log final FormData contents
            console.log('FormData entries before sending:');
            let hasFiles = false;
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    hasFiles = true;
                    console.log('FormData entry:', {
                        key: key,
                        fileName: value.name,
                        fileType: value.type,
                        fileSize: value.size,
                        lastModified: value.lastModified,
                        fieldName: value.fieldName
                    });
                } else {
                    console.log('FormData entry:', { key: key, value: value });
                }
            }
            if (!hasFiles) {
                console.warn('No files found in FormData!');
            }
        } catch (error) {
            console.error('File validation error:', error);
            mediaError.textContent = error.message;
            mediaError.style.display = 'block';
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            return;
        }
        
        try {
            console.log('Sending request to /api/posts');
            const response = await fetch('/api/posts', {
                method: 'POST',
                body: formData,
                credentials: 'include' // This ensures cookies are sent with the request
            });
            
            console.log('Response received:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            const result = await response.json();
            console.log('Response body:', result);

            if (!response.ok) {
                throw new Error(result.message || `Server error: ${response.status} ${response.statusText}`);
            }
            
            console.log('Post created successfully:', result);
            
            // Redirect back to the main feed
            window.location.href = '/';
            
        } catch (error) {
            console.error('Error creating post:', {
                error: error,
                message: error.message,
                stack: error.stack
            });

            let errorMessage = 'Failed to create post: ';
            
            if (error.message.includes('Only image and video files are allowed')) {
                errorMessage += 'Only image and video files (jpg, jpeg, png, gif, mp4, webm, mov, avi, mpeg) are allowed.';
            } else if (error.message.includes('File too large')) {
                errorMessage += 'File size exceeds the limit of 100MB.';
            } else if (error.message.includes('Server error')) {
                errorMessage += 'Server error occurred. Please try again.';
            } else {
                errorMessage += error.message;
            }
            
            mediaError.textContent = errorMessage;
            mediaError.style.display = 'block';
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});
