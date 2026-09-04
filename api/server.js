const express = require('express');
const { MongoClient } = require('mongodb');
const { createClient } = require('redis');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://admin:SuperSecretPass123!@mongodb:27017';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

const mongoClient = new MongoClient(MONGO_URL);
const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => console.error('Redis Error:', err));

let db;

async function connectServices() {
  await mongoClient.connect();
  db = mongoClient.db('appdb');
  await redisClient.connect();
  console.log('Connected to MongoDB and Redis');
}

app.get('/health', async (req, res) => {
  try {
    await db.command({ ping: 1 });
    await redisClient.ping();
    res.status(200).json({ status: 'healthy', mongodb: 'connected', redis: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const cachedUsers = await redisClient.get('users');
    if (cachedUsers) {
      return res.json({ source: 'redis', users: JSON.parse(cachedUsers) });
    }
    const users = await db.collection('users').find().toArray();
    await redisClient.setEx('users', 60, JSON.stringify(users));
    res.json({ source: 'mongodb', users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = { name: req.body.name, email: req.body.email, createdAt: new Date() };
    const result = await db.collection('users').insertOne(user);
    await redisClient.del('users');
    res.status(201).json({ message: 'User created', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

connectServices()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start API:', err);
    process.exit(1);
  });
