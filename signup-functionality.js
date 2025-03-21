document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Basic validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};:,.<>])[a-zA-Z\d@$!%*?&#^()_+\-=\[\]{};:,.<>]{8,100}$/;
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
                email,
                password
            })
        });

        if (response.ok) {
            const data = await response.json();
            alert('Registration successful!');
            window.location.href = '/login.html'; // Redirect to login page
        } else {
            const error = await response.json();
            alert(error.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});
