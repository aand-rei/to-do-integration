const express = require('express');
const router = express.Router();
const User = require('../Utils/User');

router.get('/tasks', async (req, res) => {

    let user = new User(req);
    let result = await user.getTasks(req);

    res.send(result);

});

router.post('/tasks', async (req, res) => {

    let user = new User(req);
    let result = await user.addTask(req);

    res.send(result);

});

router.post('/login', async (req, res) => {

    let user = new User(req);
    let result = await user.login(req);

    result ? res.json({ success: true , temp_token: result}) : res.status(401).json({ error: 'Invalid username or password' });

});



module.exports = router;
