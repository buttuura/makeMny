

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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

app.use(cookieParser());

// Auth middleware
function requireAuth(req, res, next) {
    const token = req.cookies?.sid;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.sub;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Get all approved deposits for a user
app.get('/api/approved-deposits', async (req, res) => {
    const { accountName } = req.query;
    if (!accountName) {
        return res.status(400).json({ error: 'Missing accountName parameter' });
    }
    try {
        const db = await connectDB();
        const deposits = db.collection('deposits');
        const results = await deposits.find({ accountName, status: 'approved' }).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all deposits by status
// Usage: /api/deposits?status=approved|rejected|pending
app.get('/api/deposits', async (req, res) => {
    const { status } = req.query;
    try {
        const db = await connectDB();
        const deposits = db.collection('deposits');
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        const results = await deposits.find(query).sort({ createdAt: -1 }).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Reject deposit endpoint (by depositId)
app.post('/api/reject-deposit', requireAuth, requireAdmin, async (req, res) => {
    const { depositId } = req.body;
    if (!depositId) return res.status(400).json({ error: 'Missing depositId' });
    try {
        const db = await connectDB();
        const deposits = db.collection('deposits');
        const { ObjectId } = require('mongodb');
        const result = await deposits.updateOne(
            { _id: new ObjectId(depositId), status: 'pending' },
            { $set: { status: 'rejected', rejectedAt: new Date() } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Deposit not found or already rejected.' });
        }
        res.json({ message: 'Deposit rejected.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    res.clearCookie('sid', { path: '/' });
    res.json({ message: 'Logged out' });
});

// Admin middleware
async function requireAdmin(req, res, next) {
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const user = await users.findOne({ _id: new (require('mongodb').ObjectId)(req.userId) });
        if (!user || !user.roles || !user.roles.includes('admin')) {
            return res.status(403).json({ error: 'Admin required' });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}



// Deposit stats endpoint
app.get('/api/deposit-stats', async (req, res) => {
    try {
        const db = await connectDB();
        const deposits = db.collection('deposits');
        const pending = await deposits.countDocuments({ status: 'pending' });
        const approved = await deposits.countDocuments({ status: 'approved' });
        const rejected = await deposits.countDocuments({ status: 'rejected' });
        const totalRevenueAgg = await deposits.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).toArray();
        const totalRevenue = totalRevenueAgg[0]?.total || 0;
        res.json({ pending, approved, rejected, totalRevenue });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});
// Approve deposit endpoint (by depositId)
app.post('/api/approve-deposit', requireAuth, requireAdmin, async (req, res) => {
    const { depositId } = req.body;
    if (!depositId) return res.status(400).json({ error: 'Missing depositId' });
    try {
        const db = await connectDB();
        const deposits = db.collection('deposits');
        const { ObjectId } = require('mongodb');
        const result = await deposits.updateOne(
            { _id: new ObjectId(depositId), status: 'pending' },
            { $set: { status: 'approved', approvedAt: new Date() } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Deposit not found or already approved.' });
        }
        res.json({ message: 'Deposit approved.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});
// Test MongoDB connection on startup
connectDB()
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Admin bootstrap: if ADMIN_PHONE and ADMIN_PASS are set, ensure an admin user exists
if (process.env.ADMIN_PHONE && process.env.ADMIN_PASS) {
    (async () => {
        try {
            const db = await connectDB();
            const users = db.collection('users');
            let admin = await users.findOne({ phone: process.env.ADMIN_PHONE });
            if (!admin) {
                const passwordHash = await bcrypt.hash(process.env.ADMIN_PASS, 12);
                const now = new Date();
                const r = await users.insertOne({ phone: process.env.ADMIN_PHONE, firstName: 'Admin', lastName: '', email: '', passwordHash, roles: ['admin'], createdAt: now });
                console.log('Admin user created:', r.insertedId.toString());
            } else if (!admin.roles || !admin.roles.includes('admin')) {
                await users.updateOne({ _id: admin._id }, { $set: { roles: ['admin'] } });
                console.log('Admin role set for existing user');
            }
        } catch (err) {
            console.error('Admin bootstrap failed', err);
        }
    })();
}
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
    if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const existing = await users.findOne({ phone });
        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const now = new Date();
        const user = { firstName, lastName, email, phone, passwordHash, createdAt: now };
        const r = await users.insertOne(user);
        const userId = r.insertedId.toString();
        const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('sid', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7*24*3600*1000 });
        res.status(201).json({ message: 'Registration successful', user: { id: userId, firstName, lastName, email, phone } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const user = await users.findOne({ phone });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        let ok = false;
        // Prefer bcrypt hash comparison
        if (user.passwordHash) {
            ok = await bcrypt.compare(password, user.passwordHash);
        } else if (user.password) {
            // Legacy plaintext password field — compare and migrate
            if (password === user.password) {
                ok = true;
                // Migrate to hashed password
                const newHash = await bcrypt.hash(password, 12);
                try {
                    await users.updateOne({ _id: user._id }, { $set: { passwordHash: newHash }, $unset: { password: '' } });
                    console.log('Migrated legacy plaintext password for user', user._id.toString());
                } catch (e) {
                    console.error('Failed to migrate password for user', user._id.toString(), e);
                }
            }
        }
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
        const userId = user._id.toString();
        const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('sid', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7*24*3600*1000 });
        res.json({ token: 'user-token', message: 'Login successful', user: { id: userId, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get current user
app.get('/api/me', requireAuth, async (req, res) => {
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const user = await users.findOne({ _id: new (require('mongodb').ObjectId)(req.userId) });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone });
    } catch (err) {
        console.error(err);
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
        const r = await deposits.insertOne({ accountName, accountNumber, amount, status: 'pending', createdAt: new Date() });
        res.status(201).json({ message: 'Deposit request submitted. Await admin approval.', depositId: r.insertedId.toString() });
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
