import { defaultProfilePhoto } from './shared-constants.js';

// Function to get saved bookmarks from localStorage
export function getSavedBookmarks() {
    return JSON.parse(localStorage.getItem('bookmarks')) || [];
}

// Function to save a bookmark
export function saveBookmark(post) {
    const bookmarks = getSavedBookmarks();
    
    // Check if already bookmarked
    const isBookmarked = bookmarks.some(bookmark => bookmark.id === post.id);
    
    if (!isBookmarked) {
        const bookmark = {
            id: post.id,
            title: post.text || 'Untitled Post',
            description: post.text || '',
            image: post.media && post.media.length > 0 ? post.media[0].src : null,
            timestamp: post.timestamp || Date.now(),
            username: post.userName,
            userPhoto: post.profilePhoto || defaultProfilePhoto
        };
        
        bookmarks.push(bookmark);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        return true;
    }
    return false;
}

// Function to remove a bookmark
export function removeBookmark(postId) {
    const bookmarks = getSavedBookmarks();
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== postId);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
}

// Function to check if a post is bookmarked
export function isBookmarked(postId) {
    const bookmarks = getSavedBookmarks();
    return bookmarks.some(bookmark => bookmark.id === postId);
}

// Function to format profile photo URL
function formatProfilePhotoUrl(photoUrl) {
    if (!photoUrl) return defaultProfilePhoto;
    if (photoUrl.startsWith('data:')) return photoUrl;
    return photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
}

// Function to display bookmarks
export function displayBookmarks(bookmarks) {
    const grid = document.getElementById('bookmarksGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (bookmarks.length === 0) {
        grid.innerHTML = '<div class="no-bookmarks">No bookmarks found</div>';
        return;
    }

    bookmarks.forEach(bookmark => {
        const card = document.createElement('div');
        card.className = 'bookmark-card';
        
        const profilePhotoUrl = formatProfilePhotoUrl(bookmark.userPhoto);
        
        card.innerHTML = `
            <div class="user-info">
                <img src="${profilePhotoUrl}" alt="Profile" class="profile-picture">
                <span class="username">${bookmark.username || 'Anonymous'}</span>
            </div>
            ${bookmark.image ? `<img src="${bookmark.image}" alt="Post image" class="post-image">` : ''}
            <h3>${bookmark.title}</h3>
            <p>${bookmark.description}</p>
            <p class="timestamp">${new Date(bookmark.timestamp).toLocaleDateString()}</p>
            <button onclick="window.removeAndRefreshBookmark('${bookmark.id}')" class="remove-bookmark">Remove Bookmark</button>
        `;
        grid.appendChild(card);
    });
}

// Function to sort bookmarks
export function sortBookmarks(bookmarks, sortType) {
    switch(sortType) {
        case 'time-desc':
            return bookmarks.sort((a, b) => b.timestamp - a.timestamp);
        case 'time-asc':
            return bookmarks.sort((a, b) => a.timestamp - b.timestamp);
        case 'alpha-asc':
            return bookmarks.sort((a, b) => a.title.localeCompare(b.title));
        case 'alpha-desc':
            return bookmarks.sort((a, b) => b.title.localeCompare(a.title));
        default:
            return bookmarks;
    }
}

// Function to filter bookmarks
export function filterBookmarks(bookmarks, searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    return bookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchTerm) ||
        bookmark.description.toLowerCase().includes(searchTerm) ||
        bookmark.username.toLowerCase().includes(searchTerm)
    );
}

// Helper function for the onclick handler
window.removeAndRefreshBookmark = function(postId) {
    removeBookmark(postId);
    displayBookmarks(getSavedBookmarks());
};
