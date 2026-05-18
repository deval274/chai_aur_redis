import { Worker } from 'bullmq';
import { connection } from './queue.js';

const worker = new Worker(
    'emails',
    async (job) => {
        console.log(`Processing email for ${job.id} with data ${JSON.stringify(job.data)} and name ${job.name}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Email job completed", job.id, job.data, job.name);
    },
    {connection}
)

worker.on('completed', (job) => {
    console.log("job completed", job.id, job.data, job.name);
})

worker.on('failed', (job) => {
    console.log("job failed", job.id, job.data, job.name);
})

worker.on('error', (error) => {
    console.log("worker error", error);
})

