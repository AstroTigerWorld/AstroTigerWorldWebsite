document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim().toLowerCase(); // Trim and convert to lowercase
    const password = document.getElementById('password').value;

    // Check if the user already exists
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        alert("Username already exists. Please choose a different username.");
        return;
    }

    // Save the new user
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert("Registration successful! You can now log in.");
    window.location.href = 'login.html'; // Redirect to login page
});
