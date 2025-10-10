const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory user store (replace with DB for production)
const users = [];

// Registration endpoint
app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    if (users.find(u => u.phone === phone)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    users.push({ firstName, lastName, email, phone, password });
    res.json({ message: 'Registration successful' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    const user = users.find(u => u.phone === phone && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
