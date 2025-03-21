document.addEventListener('DOMContentLoaded', function() {
    // Registration Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get values only if the elements exist
            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (usernameInput && emailInput && passwordInput) {
                const username = usernameInput.value.trim();
                const email = emailInput.value.trim();
                const password = passwordInput.value.trim();

                if (username && email && password) {
                    try {
                        const response = await fetch('http://localhost:5000/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password, email })
                        });

                        if (response.ok) {
                            alert('User registered successfully!');
                            window.location.href = 'login.html';
                        } else {
                            const data = await response.json();
                            alert(data.error);
                        }
                    } catch (error) {
                        alert('Error registering user: ' + error.message);
                    }
                } else {
                    alert('Please fill in all fields.');
                }
            } else {
                alert('Please fill in all fields.');
            }
        });

        // Password strength meter
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                const password = this.value.trim();
                const strengthText = document.getElementById('passwordStrength');
                const strength = checkPasswordStrength(password);
                strengthText.textContent = strength.message;
                strengthText.style.color = strength.color;
            });
        }
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get values only if the elements exist
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            if (usernameInput && passwordInput) {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();

                if (username && password) {
                    try {
                        const response = await fetch('http://localhost:5000/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            localStorage.setItem('token', data.token);
                            window.location.href = 'index.html';
                        } else {
                            const data = await response.json();
                            alert(data.error);
                        }
                    } catch (error) {
                        alert('Error logging in: ' + error.message);
                    }
                } else {
                    alert('Please fill in all fields.');
                }
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Post Management
    const posts = [];

    document.getElementById('post-form').addEventListener('submit', function(event) {
        event.preventDefault();
        createPost();
    });

    function createPost() {
        const postContent = document.getElementById('post-content').value.trim();
        const postImages = document.getElementById('post-image').files;
        const postVideos = document.getElementById('post-video').files;

        if (postContent) {
            const post = {
                content: postContent,
                visible: true,
                likes: 0,
                recommended: false,
                notRecommended: false,
                comments: [],
                images: [],
                videos: []
            };

            for (let i = 0; i < postImages.length; i++) {
                post.images.push(URL.createObjectURL(postImages[i]));
            }

            for (let i = 0; i < postVideos.length; i++) {
                post.videos.push(URL.createObjectURL(postVideos[i]));
            }

            posts.push(post);
            document.getElementById('post-content').value = '';
            document.getElementById('post-image').value = '';
            document.getElementById('post-video').value = '';
            displayPosts();
        }
    }

    function displayPosts() {
        const postsList = document.getElementById('posts-list');
        postsList.innerHTML = '';
        posts.forEach((post, index) => {
            if (post.visible) {
                const postItem = document.createElement('li');
                postItem.textContent = post.content;

                if (post.images.length > 0) {
                    const img = document.createElement('img');
                    img.src = post.images[0]; // Show the first image
                    img.alt = 'Post Image';
                    img.style.maxWidth = '200px';
                    postItem.appendChild(img);
                }

                if (post.videos.length > 0) {
                    const video = document.createElement('video');
                    video.src = post.videos[0]; // Show the first video
                    video.controls = true;
                    postItem.appendChild(video);
                }

                postItem.innerHTML += ` <button onclick="deletePost(${index})">Delete</button>`;
                postItem.innerHTML += ` <button onclick="togglePostVisibility(${index})">Hide</button>`;
                postItem.innerHTML += ` <button onclick="likePost(${index})">Like (${post.likes})</button>`;
                postItem.innerHTML += ` <button onclick="recommendPost(${index})">Recommend</button>`;
                postItem.innerHTML += ` <button onclick="notRecommendPost(${index})">Not Recommend</button>`;
                postItem.innerHTML += ` <button onclick="addComment(${index})">Comment</button>`;
                
                const commentsList = document.createElement('ul');
                post.comments.forEach(comment => {
                    const commentItem = document.createElement('li');
                    commentItem.textContent = comment;
                    commentsList.appendChild(commentItem);
                });
                postItem.appendChild(commentsList);
                
                postsList.appendChild(postItem);
            }
        });
    }

    window.deletePost = function(index) {
        posts.splice(index, 1);
        displayPosts();
    };

    window.togglePostVisibility = function(index) {
        posts[index].visible = !posts[index].visible;
        displayPosts();
    };

    window.likePost = function(index) {
        posts[index].likes++;
        displayPosts();
    };

    window.recommendPost = function(index) {
        posts[index].recommended = true;
        displayPosts();
    };

    window.notRecommendPost = function(index) {
        posts[index].notRecommended = true;
        displayPosts();
    };

    window.addComment = function(index) {
        const comment = prompt("Enter your comment:");
        if (comment) {
            posts[index].comments.push(comment);
            displayPosts();
        }
    };

    function checkPasswordStrength(password) {
        let strength = { message: '', color: 'red' };
        const regexUpper = /[A-Z]/;
        const regexNumber = /[0-9]/;
        const regexSpecial = /[!@#$%^&*(),.?":{}|<>]/;

        if (password.length >= 8 && regexUpper.test(password) && regexNumber.test(password) && regexSpecial.test(password)) {
            strength.message = 'Strong password';
            strength.color = 'green';
        } else if (password.length >= 8) {
            strength.message = 'Weak password: must include at least one uppercase letter, one number, and one special character';
        } else {
            strength.message = 'Password too short (min 8 characters)';
        }
        return strength;
    }

    // New functionality for media cycling and like button
    let currentMediaIndex = 0;
    const mediaPosts = document.querySelectorAll('.post[data-type="media"]');
    const nextMediaButton = document.getElementById('nextMedia');
    const likeButtons = document.querySelectorAll('.like-button');
    const isLoggedIn = false; // This should be set based on your authentication logic

    nextMediaButton.addEventListener('click', () => {
        if (mediaPosts.length > 0) {
            mediaPosts[currentMediaIndex].style.display = 'none'; // Hide current media
            currentMediaIndex = (currentMediaIndex + 1) % mediaPosts.length; // Move to next media
            mediaPosts[currentMediaIndex].style.display = 'block'; // Show next media
        }
    });

    // Like button functionality
    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!isLoggedIn) {
                alert('You must be logged in to like a post.');
                return;
            }
            const liked = button.getAttribute('data-liked') === 'true';
            if (!liked) {
                button.setAttribute('data-liked', 'true');
                // Increment like count logic here
                alert('Post liked!');
            } else {
                alert('You have already liked this post.');
            }
        });
    });
});
