export function initializeDropdown() {
    console.log('Initializing dropdown functionality'); // Debug log
    // Add touch and click support for dropdown
    const menuLinks = document.querySelectorAll('.item .link');
    
    menuLinks.forEach(link => {
        // Handle both click and touch events
        ['click', 'touchstart'].forEach(eventType => {
            link.addEventListener(eventType, function(e) {
                console.log('Dropdown link clicked:', this); // Debug log
                console.log('Event type:', eventType); // Log the event type
                e.preventDefault();
                e.stopPropagation();
                
                const submenu = this.parentElement.querySelector('.submenu');
                console.log('Submenu:', submenu); // Log the submenu element
                // ... rest of the code
                console.log('Submenu:', submenu); // Log the submenu element
                const dropdownArrow = this.querySelector('.dropdown-arrow');
                const isOpen = submenu.style.visibility === 'visible';
                
                // Close all other submenus and reset arrows
                document.querySelectorAll('.submenu').forEach(menu => {
                    menu.style.visibility = 'hidden';
                    menu.style.opacity = '0';
                    menu.style.transform = 'translateY(10px)';
                });
                document.querySelectorAll('.dropdown-arrow').forEach(arrow => {
                    arrow.style.transform = 'rotate(0deg)';
                });
                
                // Toggle current submenu
                if (!isOpen) {
                    submenu.style.visibility = 'visible';
                    submenu.style.opacity = '1';
                    submenu.style.transform = 'translateY(0)';
                    if (dropdownArrow) {
                        dropdownArrow.style.transform = 'rotate(180deg)';
                    }
                } else {
                    if (dropdownArrow) {
                        dropdownArrow.style.transform = 'rotate(0deg)';
                    }
                }
            });
        });
    });
    
    // Close submenu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.menu')) {
            document.querySelectorAll('.submenu').forEach(submenu => {
                submenu.style.visibility = 'hidden';
                submenu.style.opacity = '0';
                submenu.style.transform = 'translateY(10px)';
            });
            document.querySelectorAll('.dropdown-arrow').forEach(arrow => {
                arrow.style.transform = 'rotate(0deg)';
            });
        }
    });

    // Hide create post button for guest users
    const createPostBtn = document.getElementById('createPostBtn');
    if (createPostBtn) {
        createPostBtn.style.display = 'none';
    }
}

// Initialize dropdown when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDropdown);
