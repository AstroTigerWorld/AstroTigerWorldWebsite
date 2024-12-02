document.addEventListener('DOMContentLoaded', function() {
    // Registration Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get values only if the elements exist
            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (usernameInput && emailInput && passwordInput) {
                const username = usernameInput.value.trim();
                const email = emailInput.value.trim();
                const password = passwordInput.value.trim();

                if (username && email && password) {
                    try {
                        const response = await fetch('http://localhost:5000/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password, email })
                        });

                        if (response.ok) {
                            alert('User registered successfully!');
                            window.location.href = 'login.html';
                        } else {
                            const data = await response.json();
                            alert(data.error);
                        }
                    } catch (error) {
                        alert('Error registering user: ' + error.message);
                    }
                } else {
                    alert('Please fill in all fields.');
                }
            } else {
                alert('Please fill in all fields.');
            }
        });

        // Password strength meter
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                const password = this.value.trim();
                const strengthText = document.getElementById('passwordStrength');
                const strength = checkPasswordStrength(password);
                strengthText.textContent = strength.message;
                strengthText.style.color = strength.color;
            });
        }
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get values only if the elements exist
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            if (usernameInput && passwordInput) {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();

                if (username && password) {
                    try {
                        const response = await fetch('http://localhost:5000/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            localStorage.setItem('token', data.token);
                            window.location.href = 'index.html';
                        } else {
                            const data = await response.json();
                            alert(data.error);
                        }
                    } catch (error) {
                        alert('Error logging in: ' + error.message);
                    }
                } else {
                    alert('Please fill in all fields.');
                }
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    function checkPasswordStrength(password) {
        let strength = { message: '', color: 'red' };
        const regexUpper = /[A-Z]/;
        const regexNumber = /[0-9]/;
        const regexSpecial = /[!@#$%^&*(),.?":{}|<>]/;

        if (password.length >= 8 && regexUpper.test(password) && regexNumber.test(password) && regexSpecial.test(password)) {
            strength.message = 'Strong password';
            strength.color = 'green';
        } else if (password.length >= 8) {
            strength.message = 'Weak password: must include at least one uppercase letter, one number, and one special character';
        } else {
            strength.message = 'Password too short (min 8 characters)';
        }
        return strength;
    }
});