const fs = require('fs');

// Load existing users
let users = [];
try {
    const usersData = fs.readFileSync('users.json', 'utf8');
    users = JSON.parse(usersData);
} catch (err) {
    console.log('No existing users found, starting with empty array');
}

// Create new test user
const newUser = { id: users.length + 1, firstname: 'Test', lastname: 'User', username: 'testuser', email: 'testuser@example.com', password: 'testpassword123' };
users.push(newUser);

// Save new user to users.json
fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
console.log('Test user created successfully.');
