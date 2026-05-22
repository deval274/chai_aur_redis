import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.post('/post', async(req, res) => {
    const postdata = {
        id: req.body.id,
        title: req.body.title || 'Untitled',
        content: req.body.content || 'No content',
        createdAt: Date.now(),
        views: 0
    }
    await redis.set(`post:${req.body.id}`, JSON.stringify(postdata))
    await redis.set(`post:${req.body.id}:view`, 0)
    res.json({success: true, post: postdata})
})

app.put('/post/:id/view', async(req, res) => {
    const views = req.body.views ?? 0
    await redis.set(`post:${req.params.id}:view`, views)
    res.json({success: true, viewCount: Number(views), id: req.params.id})
})

app.post('/post/:id/view', async(req, res) => {
    const view = await redis.incr(`post:${req.params.id}:view`)
    res.json({success: true, viewCount: view, id: req.params.id})
})

// leaderboard

app.post('/leaderboard/add', async(req, res) => {
    const user = {
        id: req.body.id,
        name: req.body.name,
        score: req.body.score,
        createdAt: Date.now()
    }
    await redis.zadd('leaderboard', user.score ?? 0, user.id)
    res.json({success: true, user: user})
})

app.post('/leaderboard/score', async(req, res) => {
    const score = req.body.score ?? 10
    const id = req.body.id
    const totalScore = await redis.zincrby('leaderboard', score, id)
    res.json({success: true, id, pointsAdded: score, totalScore: Number(totalScore)})
})

app.get('/leaderboard/top', async(req, res) => {
    const top = await redis.zrevrange('leaderboard', 0, 2, 'WITHSCORES')
    res.json({success: true, top: top})
})

app.get('/leaderboard/:userid/rank', async(req, res) => {
    const rank = await redis.zrevrank('leaderboard', req.params.userid)
    res.json({success: true, rank: Number(rank) + 1, id: req.params.userid})
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});