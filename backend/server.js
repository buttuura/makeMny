// Admin password setup (one-time)
app.post('/api/admin/setup', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Missing password' });
  try {
    const admins = db.collection('admins');
    const existing = await admins.findOne({});
    if (existing) return res.status(400).json({ error: 'Admin password already set' });
    await admins.insertOne({ password });
    res.json({ message: 'Admin password set' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Missing password' });
  try {
    const admins = db.collection('admins');
    const admin = await admins.findOne({ password });
    if (!admin) return res.status(401).json({ error: 'Invalid password' });
    // Simple session: return a token (not secure, but enough for demo)
    res.json({ token: 'admin-token' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});
// Simple Express backend for admin approval (MongoDB)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'makemny';
let db;

MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
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
