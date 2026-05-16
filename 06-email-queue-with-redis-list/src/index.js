import express from 'express';
import Redis from 'ioredis';

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const QUEUE_KEY = 'queue:emails';

app.post('/email', async(req, res) => {
    const job = {
        to: req.body.to,
        subject: req.body.subject || 'Welcome to the Email Queue',
        body: req.body.body || 'This is a test email',
        createdAt: Date.now()
    };
    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    return res.json({success: true, message: 'Email added to queue', job: job})
});

app.get('/email/process', async(req, res) => {
    const rawJob = await redis.rpop(QUEUE_KEY);
    if(!rawJob){
        return res.json({success: false, message: 'No emails in queue'});
    }
    const job = JSON.parse(rawJob);
    return res.json({success: true, message: 'Email processed', job: job});
})

app.get('/email/queue', async(req, res) => {
    const jobs = await redis.lrange(QUEUE_KEY, 0, -1);
    return res.json({success: true, jobs: jobs.map(job => JSON.parse(job))});
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})