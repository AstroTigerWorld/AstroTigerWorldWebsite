import { defaultProfilePhoto, defaultMediaPlaceholder } from './shared-constants.js';
import { saveBookmark, removeBookmark, isBookmarked } from './bookmarks-functionality.js';

// Function to fetch and display posts
export async function fetchAndDisplayPosts() {
    const postsContainer = document.getElementById('posts-list');
    if (!postsContainer) return;
    
    try {
        // Debugging: Log cookies before fetching posts
        console.log('Cookies before fetching posts:', document.cookie);
        
        // Retrieve token from cookies
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        const tokenValue = token ? token.split('=')[1] : '';
        console.log('Token:', tokenValue || 'No token found');

        const response = await fetch('/api/posts', {
            headers: {
                'Authorization': `Bearer ${tokenValue}`
            },
            credentials: 'include'
        });
        console.log('Fetching posts from API...');
        console.log('Authorization Header:', `Bearer ${token ? token.split('=')[1] : ''}`); // Log the authorization header
        console.log('Response status:', response.status);
        
        if (response.status === 401) {
            postsContainer.innerHTML = '<p>Please sign in to view posts.</p>';
            return;
        } else if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        const postsData = await response.json();
        
        // Set a cookie for the test post
        document.cookie = "testPost=" + encodeURIComponent(JSON.stringify(postsData[0])) + "; path=/; max-age=3600"; // 1 hour expiration
        console.log('Response data:', postsData);
        if (!Array.isArray(postsData)) {
            console.error('Expected posts data to be an array, but got:', postsData);
            postsContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
            return;
        }
        window.posts = postsData;
        console.log('Fetched posts:', window.posts);

        // Clear the container
        postsContainer.innerHTML = '';
        
        // Display each post
        window.posts.forEach((post, index) => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.setAttribute('data-post-id', post.id);
            
            // Add user info and text
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-header-left">
                        ${post.hideUsername ? 
                            `<h3>Anonymous</h3>` : 
                            `<div class="user-info">
                                <img src="${post.profilePhoto ? (post.profilePhoto.startsWith('/') ? post.profilePhoto : `/${post.profilePhoto}`) + '?t=' + new Date().getTime() : defaultProfilePhoto}" alt="Profile Photo" class="profile-photo">
                                <h3>${post.userName}</h3>
                            </div>`
                        }
                    </div>
                    <button class="bookmark-btn ${isBookmarked(post.id) ? 'bookmarked' : ''}" onclick="window.toggleBookmark('${post.id}')">
                        <svg viewBox="0 0 24 24" fill="${isBookmarked(post.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                    </button>
                </div>
            `;
            
            // Handle media if present
            if (post.media && post.media.length > 0) {
                console.log(`Post ${index} has ${post.media.length} media items`);
                const mediaContainer = document.createElement('div');
                mediaContainer.className = 'media-container';
                mediaContainer.setAttribute('data-post-index', index);
                mediaContainer.setAttribute('data-current-index', '0');
                
                // Create media display
                const mediaDisplay = document.createElement('div');
                mediaDisplay.className = 'media-display';
                
                // Display initial media
                const initialMedia = post.media[0];
                if (initialMedia.type === 'image') {
                    const img = new Image();
                    img.className = 'media-item active';
                    img.src = initialMedia.src;
                    img.alt = "Post Image";
                    img.onerror = function() {
                        console.error('Image failed to load:', this.src);
                        this.src = defaultMediaPlaceholder;
                        this.onerror = null; // Prevent infinite loop
                    };
                    mediaDisplay.appendChild(img);
                } else if (initialMedia.type === 'video') {
                    const video = document.createElement('video');
                    video.className = 'media-item active';
                    video.src = initialMedia.src;
                    video.controls = true;
                    video.onerror = function() {
                        console.error('Video failed to load:', this.src);
                        const placeholder = document.createElement('div');
                        placeholder.className = 'media-item active placeholder';
                        placeholder.style.backgroundImage = `url(${defaultMediaPlaceholder})`;
                        placeholder.style.backgroundSize = 'cover';
                        placeholder.style.backgroundPosition = 'center';
                        this.parentNode.replaceChild(placeholder, this);
                    };
                    mediaDisplay.appendChild(video);
                }
                
                mediaContainer.appendChild(mediaDisplay);
                
                // Add navigation if multiple media items
                if (post.media.length > 1) {
                    const navContainer = document.createElement('div');
                    navContainer.className = 'navigation-arrows';
                    navContainer.innerHTML = `
                        <button class="nav-button prev" data-post-index="${index}"><</button>
                        <button class="nav-button next" data-post-index="${index}">></button>
                    `;
                    mediaContainer.appendChild(navContainer);
                }
                
                postElement.appendChild(mediaContainer);
            }

            // Add post text after media
            const textContainer = document.createElement('div');
            textContainer.className = 'post-content';
            textContainer.innerHTML = `<p>${post.text || ''}</p>`;
            postElement.appendChild(textContainer);
            
            postsContainer.appendChild(postElement);
        });

        // Add event listeners for navigation
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const postIndex = parseInt(this.getAttribute('data-post-index'));
                const direction = this.classList.contains('next') ? 'next' : 'prev';
                changeMedia(postIndex, direction, window.posts);
            });
        });

    } catch (error) {
        console.error('Error:', error);
        postsContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}

// Helper function for the onclick handler
window.toggleBookmark = function(postId) {
    const bookmarkBtn = document.querySelector(`[data-post-id="${postId}"] .bookmark-btn`);
    const isBookmarkedPost = bookmarkBtn.classList.contains('bookmarked');
    
    if (isBookmarkedPost) {
        removeBookmark(postId);
        bookmarkBtn.classList.remove('bookmarked');
        bookmarkBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
        `;
    } else {
        const post = window.posts.find(p => p.id === postId);
        if (post && saveBookmark(post)) {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
            `;
        }
    }
};

function changeMedia(postIndex, direction, posts) {
    const mediaContainer = document.querySelector(`.media-container[data-post-index="${postIndex}"]`);
    if (!mediaContainer) return;

    const currentIndex = parseInt(mediaContainer.getAttribute('data-current-index'));
    const post = posts[postIndex];
    
    if (!post.media || post.media.length <= 1) return;

    let newIndex;
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % post.media.length;
    } else {
        newIndex = (currentIndex - 1 + post.media.length) % post.media.length;
    }

    const mediaDisplay = mediaContainer.querySelector('.media-display');
    const newMedia = post.media[newIndex];
    
    if (newMedia.type === 'image') {
        const img = new Image();
        img.className = 'media-item active';
        img.src = newMedia.src;
        img.alt = "Post Image";
        img.onerror = function() {
            console.error('Image failed to load:', this.src);
            this.src = defaultMediaPlaceholder;
            this.onerror = null; // Prevent infinite loop
        };
        mediaDisplay.innerHTML = '';
        mediaDisplay.appendChild(img);
    } else if (newMedia.type === 'video') {
        const video = document.createElement('video');
        video.className = 'media-item active';
        video.src = newMedia.src;
        video.controls = true;
        video.onerror = function() {
            console.error('Video failed to load:', this.src);
            const placeholder = document.createElement('div');
            placeholder.className = 'media-item active placeholder';
            placeholder.style.backgroundImage = `url(${defaultMediaPlaceholder})`;
            placeholder.style.backgroundSize = 'cover';
            placeholder.style.backgroundPosition = 'center';
            this.parentNode.replaceChild(placeholder, this);
        };
        mediaDisplay.innerHTML = '';
        mediaDisplay.appendChild(video);
    }
    
    mediaContainer.setAttribute('data-current-index', newIndex.toString());
}
