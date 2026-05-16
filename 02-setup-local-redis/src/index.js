import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();

const redis = new Redis({url: process.env.REDIS_URL || 'redis://localhost:6379'});
const mongo_url = process.env.MONGO_URL || 'mongodb://localhost:27017/chai_aur_redis';

app.get('/redis', async(req, res) => {
    const reply = await redis.ping();
    res.json({redis: reply});
});

app.get('/mongo', async(req, res) => {
    if(mongoose.connection.readyState === 0){
        await mongoose.connect(mongo_url)
    }
    res.json({mongo: 'connected', database: mongoose.connection.name})
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})