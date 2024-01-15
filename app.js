const express = require('express');
const app = express();
const {getAllTopics, postTopic} = require('./controllers/topic.controller');

app.use(express.json());

app.get('/api/topics', getAllTopics);
app.post('/api/topics', postTopic);

app.use((err, req, res, next) => {
    const sqlErrors = ['23502']
    if (sqlErrors.includes(err.code)) {
        res.status(400).send({msg: 'Bad request'})
    } else {
        next(err)
    }
})

app.use((err, req, res, next)=>{
    res.status(500).send({msg: "Server error"})
})

module.exports = app;