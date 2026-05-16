import express from 'express';
import Redis from 'ioredis';

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function otpKey(number){
    return `otp:${number}`;
}

// app.post('/otp', async(req, res) => {
//     const {phone} = req.body;
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     await redis.set(otpKey(phone), otp, 'EX', 30);
//     res.json({success: true, otp: otp});
// });

// app.post('/otp/verify', async(req, res) => {
//     const {phone, otp} = req.body;
//     const savedOtp = await redis.get(otpKey(phone));
//     if(!savedOtp){
//         return res.status(404).json({error: 'OTP expired or not found'});
//     }
//     if(savedOtp !== otp){
//         return res.status(401).json({error: 'Invalid OTP'});
//     } 
//     await redis.del(otpKey(phone));
//     res.json({success: true, message: 'OTP verified successfully'});
// })

app.post('/otp', async(req, res) => {
    const {phone} = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    const otpData = {
        otp: otp.toString(),
        attempts: 0,
        maxAttempts: 3,
        createdAt: Date.now(),
        lastAttemptAt: null,
        blockedUntil: null
    };

    await redis.set(
        otpKey(phone),
        JSON.stringify(otpData),
        "EX",
        60
    )

    res.json({
        success: true,
        otp: otp
    })
})

app.post('/otp/verify', async(req, res) => {
    const {phone, otp} = req.body;
    const savedOtp = await redis.get(otpKey(phone));

    if(!savedOtp){
        return res.status(404).json({error: 'OTP expired'});
    }

    const otpData = JSON.parse(savedOtp);

    if(otpData.blockedUntil && Date.now() < otpData.blockedUntil){
        return res.status(403).json({error: `Account blocked until ${new Date(otpData.blockedUntil).getMinutes()}:${new Date(otpData.blockedUntil).getSeconds()}`});
    }

    if(otpData.otp !== otp){
        otpData.attempts += 1;
        otpData.lastAttemptAt = Date.now();

        if(otpData.attempts >= otpData.maxAttempts){
            otpData.blockedUntil = Date.now() + 1000 * 60;

            await redis.set(
                otpKey(phone),
                JSON.stringify(otpData),
                "EX",
                60
            )

            return res.status(403).json({error: `Account blocked until ${new Date(otpData.blockedUntil).getMinutes()}:${new Date(otpData.blockedUntil).getSeconds()}`});
        }

        const ttl = await redis.ttl(otpKey(phone));

        await redis.set(
            otpKey(phone),
            JSON.stringify(otpData),
            "EX",
            ttl
        )

        return res.status(401).json({
            error: 'Invalid OTP',
            attemptsLeft: otpData.maxAttempts - otpData.attempts,
            timeLeft: ttl
        })
    }

    await redis.del(otpKey(phone));
    res.json({success: true, message: 'OTP verified successfully'});
})

app.get('/otp/:phone/ttl', async(req, res) => {
    const ttl = await redis.ttl(otpKey(req.params.phone));
    res.json({timeLeft: ttl});
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});