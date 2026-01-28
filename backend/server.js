// Simple Express backend for admin approval (MongoDB)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '../')));

// Route for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Admin setup (one-time, phone number + password)
app.post('/api/admin/setup', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });
  try {
    const admins = db.collection('admins');
    const existing = await admins.findOne({});
    if (existing) return res.status(400).json({ error: 'Admin already set' });
    await admins.insertOne({ phone, password });
    res.json({ message: 'Admin setup complete' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin login (phone number + password)
app.post('/api/admin/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });
  try {
    const admins = db.collection('admins');
    const admin = await admins.findOne({ phone, password });
    if (!admin) return res.status(401).json({ error: 'Invalid phone or password' });
    // Simple session: return a token (not secure, but enough for demo)
    res.json({ token: 'admin-token', phone });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// User login (phone number + password)
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });
  try {
    // Try to use MongoDB if connected, otherwise use in-memory test data
    if (db) {
      const users = db.collection('users');
      const user = await users.findOne({ phone, password });
      if (!user) return res.status(401).json({ error: 'Invalid phone or password' });
    } else {
      // In-memory test users (for when MongoDB is not connected)
      const testUsers = [
        { phone: '+1234567890', password: 'test123' },
        { phone: '+9876543210', password: 'password123' }
      ];
      const user = testUsers.find(u => u.phone === phone && u.password === password);
      if (!user) return res.status(401).json({ error: 'Invalid phone or password' });
    }
    // Simple session: return a token (not secure, for demo)
    res.json({ token: 'user-token', phone });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://delmedah_db_user:Buttuura123@cluster0.od3sa0a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'makemny';
let db;

MongoClient.connect(MONGO_URL)
  .then(client => {
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    // Continue running server even if DB connection fails initially
    console.log('Server will continue running, but DB operations may fail until connection is established');
  });

app.get('/api/deposits', async (req, res) => {
  try {
    const deposits = db.collection('deposits');
    const results = await deposits.find({ status: 'pending' }).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/approve-deposit', async (req, res) => {
  const { depositId } = req.body;
  if (!depositId) return res.status(400).json({ error: 'Missing depositId' });
  try {
    const deposits = db.collection('deposits');
    const result = await deposits.updateOne(
      { _id: new ObjectId(depositId), status: 'pending' },
      { $set: { status: 'approved', approvedAt: new Date() } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Deposit not found or already approved.' });
    }
    res.json({ message: 'Deposit approved.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/reject-deposit', async (req, res) => {
  const { depositId } = req.body;
  if (!depositId) return res.status(400).json({ error: 'Missing depositId' });
  try {
    const deposits = db.collection('deposits');
    const result = await deposits.updateOne(
      { _id: new ObjectId(depositId), status: 'pending' },
      { $set: { status: 'rejected', rejectedAt: new Date() } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Deposit not found or already rejected.' });
    }
    res.json({ message: 'Deposit rejected.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Endpoint to submit a deposit request
app.post('/api/deposit', async (req, res) => {
  const { accountName, accountNumber, amount } = req.body;
  if (!accountName || !accountNumber || !amount) {
    return res.status(400).json({ error: 'Missing deposit info' });
  }
  try {
    const deposits = db.collection('deposits');
    const result = await deposits.insertOne({
      accountName,
      accountNumber,
      amount,
      status: 'pending',
      createdAt: new Date()
    });
    res.json({ message: 'Deposit submitted', depositId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Endpoint to get all pending deposits (for polling)
app.get('/api/pending-deposits', async (req, res) => {
  try {
    const deposits = db.collection('deposits');
    const results = await deposits.find({ status: 'pending' }).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});
