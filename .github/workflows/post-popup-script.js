document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('post-popup');
    const closeButton = document.getElementById('close-popup');
    const postForm = document.getElementById('post-form');

    // Close popup when clicking the close button
    closeButton.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    // Close popup when clicking outside the content
    window.addEventListener('click', function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });

    // Handle form submission
    postForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(postForm);
        
        fetch('/api/posts', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                popup.style.display = 'none';
                postForm.reset();
                window.location.reload(); // Reload to show new post
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
