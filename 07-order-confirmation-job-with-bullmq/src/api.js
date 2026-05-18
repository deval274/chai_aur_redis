import express from 'express';
import { emailQueue } from './queue.js';

const app = express();

app.use(express.json());

app.post('/email-queue', async(req, res) => {
    const job = await emailQueue.add(
        'emailJob',
        {
            to: req.body.to,
            subject: req.body.subject || 'Welcome to the Email Queue',
            body: req.body.body || 'This is a test email',
        },
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        }
    )
    return res.json({success: true, message: 'Email added to queue', job: job});
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})