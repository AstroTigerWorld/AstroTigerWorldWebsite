document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Basic validation
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Password requirements validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[!-~]{8,100}$/;
    if (!passwordRegex.test(password)) {
        alert('Password must be 8-100 characters and include at least one letter, one number, and one special character');
        return;
    }

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstname,
                lastname,
                username,
                email,
                password
            })
        });

        // Check if the response is OK
        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || 'Registration failed. Please try again.');
            return;
        }

        const data = await response.json();

        const successAnimation = document.getElementById('successAnimation');
        const overlay = document.getElementById('overlay');
        if (successAnimation && overlay) {
            overlay.classList.add('show');
            successAnimation.classList.add('show');
            
            // Wait for animation to complete (2 seconds) before redirecting
            setTimeout(() => {
                overlay.classList.remove('show');
                successAnimation.classList.remove('show');
                window.location.href = '/login.html';
            }, 2000);
        } else {
            // If animation elements are not found, redirect immediately
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration. Please try again.');
    }
});
