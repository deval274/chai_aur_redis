import Redis from 'ioredis'

const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

subscriber.subscribe('notifications', (err) => {
    if(err){
        console.error('Error subscribing to notifications', err);
    }
    console.log('Subscribed to notifications');
});

subscriber.on('message', (channel, message) => {
    console.log("Received message on channel", channel, "with message: ", JSON.parse(message));
});