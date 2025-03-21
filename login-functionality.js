document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupButton = document.getElementById('signupButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const successAnimation = document.getElementById('successAnimation');
    const overlay = document.getElementById('overlay');

    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    // Add click event listener for signup button
    if (signupButton) {
        signupButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.replace('/signup.html');
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Log the email and password values
        console.log('Email:', email);
        console.log('Password:', password);

        // Input validation
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        // Show loading indicator
        if (loadingIndicator) {
            loadingIndicator.classList.add('show');
        }

        try {
            console.log('Sending login request...');
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password
                })
            });

            console.log('Response received:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log('Response data:', data);
            } else {
                console.error('Response was not JSON:', contentType);
                throw new Error('Server response was not JSON');
            }

            if (response.ok) {
                // Set the JWT token in a cookie and log it
                document.cookie = `token=${data.token}; path=/; secure; HttpOnly; SameSite=Strict`;
                console.log('Token set in cookie:', data.token);

                if (successAnimation && overlay) {
                    overlay.classList.add('show');
                    successAnimation.classList.add('show');
                    
                    // Wait for animation to complete (2 seconds) before redirecting
                    setTimeout(() => {
                        overlay.classList.remove('show');
                        successAnimation.classList.remove('show');
                        window.location.replace('/');
                    }, 2000);
                } else {
                    // If animation elements are not found, redirect immediately
                    window.location.replace('/');
                }
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
        } finally {
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.remove('show');
            }
        }
    });

    // Add event listener for password input to show/hide password
    if (passwordInput) {
        const passwordToggle = document.getElementById('password-toggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    passwordToggle.textContent = 'Hide password';
                } else {
                    passwordInput.type = 'password';
                    passwordToggle.textContent = 'Show password';
                }
            });
        }
    }
});