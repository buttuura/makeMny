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
