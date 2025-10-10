const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connectDB = require('./db');

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const existing = await users.findOne({ phone });
        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }
        await users.insertOne({ firstName, lastName, email, phone, password });
        res.json({ message: 'Registration successful' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { phone, password } = req.body;
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const user = await users.findOne({ phone, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
