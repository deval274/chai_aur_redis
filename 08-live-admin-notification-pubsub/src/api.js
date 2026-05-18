import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.post('/notifications', async(req, res) => {
    const payload = {
        title: req.body.title || 'New Notification',
        message: req.body.message || 'This is a test notification',
        createdAt: Date.now(),
    };
    await publisher.publish('notifications', JSON.stringify(payload));
    return res.json({success: true, message: 'Notification published', payload: payload});
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});