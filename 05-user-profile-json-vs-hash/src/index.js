import express from 'express';
import Redis from 'ioredis';

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.post('/user/:id/json', async(req, res) => {
    await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));
    res.json({success: true, savedAs: "JSON"})
})

app.get('/user/:id/json', async(req, res) => {
    const userJson = await redis.get(`user:${req.params.id}:json`);
    res.json({user: userJson ? JSON.parse(userJson) : null})
});

app.post('/user/:id/hash', async(req, res) => {
    await redis.hset(`user:${req.params.id}:hash`, req.body);
    res.json({success: true, savedAs: "HASH"})
});

app.get('/user/:id/hash', async(req, res) => {
    const userHash = await redis.hgetall(`user:${req.params.id}:hash`);
    res.json({user: userHash})
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});