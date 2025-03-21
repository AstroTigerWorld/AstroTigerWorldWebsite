document.addEventListener('DOMContentLoaded', async function() {
    const postContainer = document.getElementById('postContainer');
    
    try {
        // Fetch posts from the server
        const response = await fetch('/api/posts');
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        const posts = await response.json();
        console.log('Fetched posts:', posts);

        // Clear the container
        postContainer.innerHTML = '';
        
        // Display each post
        posts.forEach((post, index) => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            
            // Add user name and text
            postElement.innerHTML = `
                <div class="post-header">
                    <h3>${post.userName}</h3>
                </div>
                <p>${post.text}</p>
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
                    mediaDisplay.innerHTML = `<img src="${initialMedia.src}" alt="Post Image" class="media-item active">`;
                } else if (initialMedia.type === 'video') {
                    mediaDisplay.innerHTML = `<video src="${initialMedia.src}" controls class="media-item active"></video>`;
                }
                
                mediaContainer.appendChild(mediaDisplay);
                
                // Add navigation if multiple media items
                if (post.media.length > 1) {
                    console.log('Adding navigation arrows to post', index);
                    const navContainer = document.createElement('div');
                    navContainer.className = 'media-nav';
                    navContainer.innerHTML = `
                        <button class="nav-button prev" data-post-index="${index}">&lt;</button>
                        <button class="nav-button next" data-post-index="${index}">&gt;</button>
                    `;
                    mediaContainer.appendChild(navContainer);
                }
                
                postElement.appendChild(mediaContainer);
            }
            
            postContainer.appendChild(postElement);
        });

        // Add event listeners for navigation
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const postIndex = parseInt(this.getAttribute('data-post-index'));
                const direction = this.classList.contains('next') ? 'next' : 'prev';
                changeMedia(postIndex, direction, posts);
            });
        });
    } catch (error) {
        console.error('Error:', error);
        postContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
});

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
        mediaDisplay.innerHTML = `<img src="${newMedia.src}" alt="Post Image" class="media-item active">`;
    } else if (newMedia.type === 'video') {
        mediaDisplay.innerHTML = `<video src="${newMedia.src}" controls class="media-item active"></video>`;
    }
    
    mediaContainer.setAttribute('data-current-index', newIndex.toString());
    console.log(`Changed to media item ${newIndex + 1} of ${post.media.length}`);
}
