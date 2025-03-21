const fs = require('fs');
const bcrypt = require('bcrypt');

// Load existing users
let users = [];
try {
    const usersData = fs.readFileSync('users.json', 'utf8');
    users = JSON.parse(usersData);
} catch (err) {
    console.log('No existing users found, starting with empty array');
}

// Create a new test user
const newTestUser = {
    id: users.length + 1,
    firstname: "New",
    lastname: "User",
    username: "newuser",
    email: "newuser@example.com",
    password: "password123" // Known plaintext password
};

// Hash the password
bcrypt.hash(newTestUser.password, 10, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    newTestUser.password = hashedPassword; // Update password to hashed version

    // Add the new user to the users array
    users.push(newTestUser);

    // Save updated users to users.json
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    console.log('New test user added successfully with hashed password.');
});
