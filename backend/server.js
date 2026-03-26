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

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://delmedah_db_user:Buttuura123@cluster0.od3sa0a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'makemny';
let db;
let dbConnected = false;

// Initialize database connection BEFORE starting the server
async function initDB() {
  try {
    const client = await MongoClient.connect(MONGO_URL);
    db = client.db(DB_NAME);
    dbConnected = true;
    console.log('Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Please check your MONGO_URL and ensure MongoDB Atlas is accessible');
    return false;
  }
}

// Middleware to check if DB is connected
function requireDB(req, res, next) {
  if (!dbConnected || !db) {
    return res.status(503).json({ error: 'Database connection unavailable' });
  }
  next();
}

// Route for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Admin setup (one-time, phone number + password)
app.post('/api/admin/setup', requireDB, async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });
  try {
    const admins = db.collection('admins');
    const existing = await admins.findOne({});
    if (existing) return res.status(400).json({ error: 'Admin already set' });
    await admins.insertOne({ phone, password });
    res.json({ message: 'Admin setup complete' });
  } catch (err) {
    console.error('Admin setup error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin login (phone number + password)
app.post('/api/admin/login', requireDB, async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });
  try {
    const admins = db.collection('admins');
    const admin = await admins.findOne({ phone, password });
    if (!admin) return res.status(401).json({ error: 'Invalid phone or password' });
    // Simple session: return a token (not secure, but enough for demo)
    res.json({ token: 'admin-token', phone });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// User login (phone number + password)
app.post('/api/login', requireDB, async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });
  try {
    const users = db.collection('users');
    const user = await users.findOne({ phone, password });
    if (!user) return res.status(401).json({ error: 'Invalid phone or password' });
    // Simple session: return a token (not secure, for demo)
    res.json({ token: 'user-token', phone });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/deposits', requireDB, async (req, res) => {
  try {
    const deposits = db.collection('deposits');
    const results = await deposits.find({ status: 'pending' }).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/approve-deposit', requireDB, async (req, res) => {
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

app.post('/api/reject-deposit', requireDB, async (req, res) => {
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

// Endpoint to submit a deposit request
app.post('/api/deposit', requireDB, async (req, res) => {
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
app.get('/api/pending-deposits', requireDB, async (req, res) => {
  try {
    const deposits = db.collection('deposits');
    const results = await deposits.find({ status: 'pending' }).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server function
async function startServer() {
  const dbInitialized = await initDB();
  if (!dbInitialized) {
    console.warn('Warning: Server starting without database connection. DB operations will fail.');
  }
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (dbInitialized) {
      console.log('Database is ready for operations');
    }
  });
}

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
