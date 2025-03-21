// Search and filter functionality
function initializeSearch(posts, renderPosts) {
    const searchInput = document.getElementById('searchInput');
    const filterIcon = document.getElementById('filter-icon');
    
    // Create filter menu
    const filterMenu = document.createElement('div');
    filterMenu.className = 'filter-menu';
    filterMenu.innerHTML = `
        <div class="filter-option">
            <input type="checkbox" id="filterUsername" />
            <label for="filterUsername">Username</label>
        </div>
        <div class="filter-option">
            <input type="checkbox" id="filterContent" />
            <label for="filterContent">Post Content</label>
        </div>
        <div class="filter-option">
            <input type="checkbox" id="filterMedia" />
            <label for="filterMedia">Media Posts</label>
        </div>
    `;
    document.getElementById('main').appendChild(filterMenu);

    // Toggle filter menu
    filterIcon.addEventListener('click', () => {
        filterMenu.classList.toggle('show');
        filterIcon.classList.toggle('active');
    });

    // Close filter menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!filterIcon.contains(e.target) && !filterMenu.contains(e.target)) {
            filterMenu.classList.remove('show');
            filterIcon.classList.remove('active');
        }
    });

    // Search functionality
    searchInput.addEventListener('input', debounce(() => {
        const searchTerm = searchInput.value.toLowerCase();
        const filterUsername = document.getElementById('filterUsername').checked;
        const filterContent = document.getElementById('filterContent').checked;
        const filterMedia = document.getElementById('filterMedia').checked;
        
        const filteredPosts = posts.filter(post => {
            if (searchTerm === '') return true;
            
            let matches = false;
            
            if (!filterUsername && !filterContent && !filterMedia) {
                // If no filters selected, search everything
                matches = post.userName.toLowerCase().includes(searchTerm) ||
                        post.text.toLowerCase().includes(searchTerm);
            } else {
                // Apply selected filters
                if (filterUsername) {
                    matches = matches || post.userName.toLowerCase().includes(searchTerm);
                }
                if (filterContent) {
                    matches = matches || post.text.toLowerCase().includes(searchTerm);
                }
                if (filterMedia) {
                    matches = matches || (post.media && post.media.length > 0);
                }
            }
            
            return matches;
        });
        
        renderPosts(filteredPosts);
    }, 300));

    // Add filter change handlers
    document.querySelectorAll('.filter-option input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Trigger search on filter change
            searchInput.dispatchEvent(new Event('input'));
        });
    });
}

// Debounce function to limit how often the search is performed
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
