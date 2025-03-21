document.addEventListener('DOMContentLoaded', function() {
    const profilePreview = document.getElementById('profilePreview');
    const popup = document.querySelector('.profile-picture-popup');
    const overlay = document.querySelector('.popup-overlay');
    const openPopupBtn = document.getElementById('openProfilePicker');
    const closePopupBtn = document.querySelector('.close-popup');
    const savePopupBtn = document.querySelector('.save-picture');
    const predefinedImages = document.querySelectorAll('.predefined-image');
    const customPictureInput = document.getElementById('customPictureInput');
    const editAccountForm = document.getElementById('editAccountForm');
    const newUsername = document.getElementById('newUsername');

    // Load current user data
    fetch('/api/user', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            newUsername.value = data.data.username || '';
            if (data.data.profilePhoto) {
                profilePreview.src = data.data.profilePhoto.startsWith('/') 
                    ? data.data.profilePhoto 
                    : '/' + data.data.profilePhoto;
            }
        } else {
            window.location.href = 'login.html';
        }
    })
    .catch(error => {
        console.error('Error loading user data:', error);
        window.location.href = 'login.html';
    });

    // Open popup
    openPopupBtn.addEventListener('click', function() {
        popup.classList.add('active');
        overlay.classList.add('active');
    });

    // Close popup
    closePopupBtn.addEventListener('click', function() {
        popup.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', function() {
        popup.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Handle predefined image selection
    let selectedImage = null;
    let selectedImageType = null; // 'predefined' or 'custom'
    predefinedImages.forEach(img => {
        img.addEventListener('click', function() {
            predefinedImages.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            selectedImage = this.getAttribute('src').split('/').pop();
            selectedImageType = 'predefined';
            customPictureInput.value = ''; // Clear any custom upload
        });
    });

    // Add click handler for upload button
    document.querySelector('.upload-button').addEventListener('click', function() {
        customPictureInput.click();
    });

    // Handle custom picture upload
    customPictureInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                predefinedImages.forEach(i => i.classList.remove('selected'));
                selectedImage = file;
                selectedImageType = 'custom';
                profilePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Save selected picture
    savePopupBtn.addEventListener('click', function() {
        if (!selectedImage) {
            alert('Please select an image first');
            return;
        }

        if (selectedImageType === 'custom') {
            const formData = new FormData();
            formData.append('profilePicture', selectedImage);

            fetch('/api/update-profile-picture', {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
                if (data.success) {
                    const photoPath = data.profilePhoto.startsWith('/') 
                        ? data.profilePhoto 
                        : '/' + data.profilePhoto;
                    console.log('Setting photo path:', photoPath);
                    
                    profilePreview.src = photoPath;
                    popup.classList.remove('active');
                    overlay.classList.remove('active');
                    
                    // Update localStorage with new profile photo
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    console.log('Current user before update:', currentUser);
                    if (currentUser) {
                        currentUser.profilePhoto = photoPath;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        console.log('Updated user in localStorage:', currentUser);
                    }
                    
                    // Delay redirect slightly to ensure localStorage is updated
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 100);
                } else {
                    alert('Failed to update profile picture: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error updating profile picture:', error);
                alert('Failed to update profile picture');
            });
        } else if (selectedImageType === 'predefined') {
            fetch('/api/update-profile-picture', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    predefinedImage: selectedImage
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response (predefined):', data);
                if (data.success) {
                    const photoPath = data.profilePhoto.startsWith('/') 
                        ? data.profilePhoto 
                        : '/' + data.profilePhoto;
                    console.log('Setting predefined photo path:', photoPath);
                    
                    profilePreview.src = photoPath;
                    popup.classList.remove('active');
                    overlay.classList.remove('active');
                    
                    // Update localStorage with new profile photo
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    console.log('Current user before predefined update:', currentUser);
                    if (currentUser) {
                        currentUser.profilePhoto = photoPath;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        console.log('Updated user in localStorage (predefined):', currentUser);
                    }
                    
                    // Delay redirect slightly to ensure localStorage is updated
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 100);
                } else {
                    alert('Failed to update profile picture: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error updating profile picture:', error);
                alert('Failed to update profile picture');
            });
        }
    });

    // Handle form submission
    editAccountForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const updateData = {
            username: newUsername.value
        };

        if (newPassword.trim()) {
            updateData.password = newPassword;
        }

        fetch('/api/update-profile', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update localStorage with new username
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser) {
                    currentUser.username = updateData.username;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    console.log('Updated username in localStorage:', currentUser);
                }
                // Delay redirect slightly to ensure localStorage is updated
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 100);
            } else {
                alert('Failed to update profile: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        });
    });
});
