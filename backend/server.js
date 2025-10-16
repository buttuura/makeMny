// Get approved deposits for a user
app.get('/api/approved-deposits', (req, res) => {
    const { accountName } = req.query;
    if (!accountName) {
        return res.status(400).json({ message: 'Missing account name' });
    }
    const approved = pendingDeposits.filter(d => d.accountName === accountName && d.status === 'approved');
    res.json(approved);
});
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
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users.push({ username, password });
    res.json({ message: 'Registration successful' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful' });
});


// In-memory pending deposits (for demo)
const pendingDeposits = [];

// Deposit submission endpoint
app.post('/api/deposit', (req, res) => {
    const { accountName, accountNumber, amount } = req.body;
    if (!accountName || !accountNumber || !amount) {
        return res.status(400).json({ message: 'Missing account name, number, or amount' });
    }
    pendingDeposits.push({ accountName, accountNumber, amount, status: 'pending' });
    res.json({ message: 'Deposit submitted for approval' });
});

// Get pending deposits (for admin)
app.get('/api/pending-deposits', (req, res) => {
    res.json(pendingDeposits.filter(d => d.status === 'pending'));
});

// Approve deposit (for admin)
app.post('/api/approve-deposit', (req, res) => {
    const { accountName, amount } = req.body;
    const deposit = pendingDeposits.find(d => d.accountName === accountName && d.amount === amount && d.status === 'pending');
    if (!deposit) {
        return res.status(404).json({ message: 'Deposit not found' });
    }
    deposit.status = 'approved';
    res.json({ message: 'Deposit approved' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
