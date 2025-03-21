document.addEventListener('DOMContentLoaded', () => {
    const emailForm = document.getElementById('emailForm');
    const verificationForm = document.getElementById('verificationForm');
    const newPasswordForm = document.getElementById('newPasswordForm');
    const resetCodeInput = document.getElementById('resetCode');
    let userEmail = '';

    // Handle reset code input
    resetCodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
        const messageDiv = document.getElementById('verificationMessage');
        messageDiv.style.display = 'none';
    });

    // Handle form validation
    verificationForm.addEventListener('submit', (e) => {
        const code = resetCodeInput.value;
        const messageDiv = document.getElementById('verificationMessage');
        
        if (!/^[A-Z0-9]{5}$/.test(code)) {
            e.preventDefault();
            messageDiv.textContent = 'Please enter a valid 5-character code';
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
            return;
        }
    });

    // Handle email form submission
    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const messageDiv = document.getElementById('emailMessage');

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Reset code generated! Check the server terminal/console for the code (Test Mode)';
                messageDiv.className = 'message success';
                console.log('Note: In test mode, the reset code appears in the server terminal/console.');
                userEmail = email;
                emailForm.style.display = 'none';
                verificationForm.style.display = 'block';
            } else {
                messageDiv.textContent = data.message || 'Error sending reset code';
                messageDiv.className = 'message error';
            }
        } catch (error) {
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.className = 'message error';
        }
    });

    // Handle verification code submission
    verificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('resetCode').value.toUpperCase();
        const messageDiv = document.getElementById('verificationMessage');

        // Validate code format
        if (!/^[A-Z0-9]{5}$/.test(code)) {
            messageDiv.textContent = 'Please enter a valid 5-character code';
            messageDiv.className = 'message error';
            return;
        }

        try {
            const response = await fetch('/api/verify-reset-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: userEmail,
                    code: code
                })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Code verified successfully!';
                messageDiv.className = 'message success';
                verificationForm.style.display = 'none';
                newPasswordForm.style.display = 'block';
            } else {
                messageDiv.textContent = data.message || 'Invalid verification code';
                messageDiv.className = 'message error';
            }
        } catch (error) {
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.className = 'message error';
        }
    });

    // Handle new password submission
    newPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const messageDiv = document.getElementById('passwordMessage');

        if (newPassword !== confirmPassword) {
            messageDiv.textContent = 'Passwords do not match';
            messageDiv.className = 'message error';
            return;
        }

        if (newPassword.length < 8) {
            messageDiv.textContent = 'Password must be at least 8 characters long';
            messageDiv.className = 'message error';
            return;
        }

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userEmail,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Password reset successful! Redirecting to login...';
                messageDiv.className = 'message success';
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                messageDiv.textContent = data.message || 'Error resetting password';
                messageDiv.className = 'message error';
            }
        } catch (error) {
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.className = 'message error';
        }
    });
});
