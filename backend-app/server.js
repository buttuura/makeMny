const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const path = require('path');
// Serve static files from the project root
app.use(express.static(path.join(__dirname, '../')));

// Serve login.html at /login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
});

// Serve registration.html at /registration
app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, '../registration.html'));
});

const connectDB = require('./db');
// Test MongoDB connection on startup
connectDB()
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));
// Serve index page
app.get('/', (req, res) => {
    res.send('Welcome to MakeMny backend!');
});

// Serve registration page
app.get('/registration', (req, res) => {
    res.send('Registration endpoint is live. Use POST /api/register to register.');
});

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


// Deposit endpoint
app.post('/api/deposit', async (req, res) => {
    const { accountName, accountNumber, amount } = req.body;
    try {
        const db = await connectDB();
        const deposits = db.collection('deposits');
        // Save deposit as pending approval
        await deposits.insertOne({ accountName, accountNumber, amount, status: 'pending', createdAt: new Date() });
        res.json({ message: 'Deposit request submitted. Await admin approval.' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Pending deposits endpoint
app.get('/api/pending-deposits', async (req, res) => {
    try {
        const db = await connectDB();
        const deposits = db.collection('deposits');
        // Return all deposits still pending approval
        const pending = await deposits.find({ status: 'pending' }).toArray();
        res.json(pending);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
