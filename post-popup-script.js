document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const postText = document.getElementById('postText').value;
    const postImages = document.getElementById('postImages').files;
    const postVideos = document.getElementById('postVideos').files;

    const formData = new FormData();
    formData.append('text', postText);

    for (let i = 0; i < postImages.length; i++) {
        formData.append('images', postImages[i]);
    }

    for (let i = 0; i < postVideos.length; i++) {
        formData.append('videos', postVideos[i]);
    }

    fetch('/api/posts', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Post created:', data);
        document.getElementById('postPopup').style.display = 'none';
        document.getElementById('postForm').reset();
        updateForYouSection(data);
    })
    .catch(error => {
        console.error('Error creating post:', error);
    });
});

function updateForYouSection(post) {
    const forYouSection = document.getElementById('forYouSection');
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const postContent = `
        <h3>${post.userName}</h3>
        <p>${post.text}</p>
        ${post.imageUrl.map(url => `<img src="${url}" alt="Post Image" />`).join('')}
        ${post.videoUrl.map(url => `<video src="${url}" controls></video>`).join('')}
        <div class="post-actions">
            <button class="like-button">Like</button>
            <button class="save-button">Save</button>
            <span class="like-count">0 Likes</span>
        </div>
        <div class="comments-section">
            <button class="comment-button" onclick="toggleCommentInput(this)">Comment</button>
            <div class="comments"></div>
            <div class="comment-input" style="display:none;">
                <input type="text" placeholder="Write a comment..." />
                <button onclick="addComment(this)">Submit</button>
            </div>
        </div>
    `;

    postElement.innerHTML = postContent;
    forYouSection.prepend(postElement);
}

function toggleCommentInput(button) {
    const commentInput = button.nextElementSibling.nextElementSibling;
    commentInput.style.display = commentInput.style.display === 'none' ? 'block' : 'none';
}

function addComment(button) {
    const commentInput = button.previousElementSibling;
    const commentText = commentInput.value;
    if (commentText) {
        const commentsDiv = button.parentElement.previousElementSibling;
        const commentElement = document.createElement('div');
        commentElement.textContent = commentText;
        commentsDiv.appendChild(commentElement);
        commentInput.value = '';
    }
}

window.currentMediaIndex = {};

window.prevMedia = function(index) {
    if (!currentMediaIndex[index]) currentMediaIndex[index] = 0;
    currentMediaIndex[index] = (currentMediaIndex[index] - 1 + posts[index].images.length + posts[index].videos.length) % (posts[index].images.length + posts[index].videos.length);
    updateMediaDisplay(index);
};

window.nextMedia = function(index) {
    if (!currentMediaIndex[index]) currentMediaIndex[index] = 0;
    currentMediaIndex[index] = (currentMediaIndex[index] + 1) % (posts[index].images.length + posts[index].videos.length);
    updateMediaDisplay(index);
};

function updateMediaDisplay(index) {
    const mediaDisplay = document.getElementById(`media-display-${index}`);
    const mediaIndex = currentMediaIndex[index];
    const isImage = mediaIndex < posts[index].images.length;

    if (isImage) {
        mediaDisplay.innerHTML = `<img src="${posts[index].images[mediaIndex]}" class="post-image">`;
    } else {
        const videoIndex = mediaIndex - posts[index].images.length;
        mediaDisplay.innerHTML = `<video src="${posts[index].videos[videoIndex]}" class="post-video" controls></video>`;
    }
}