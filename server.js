require('dotenv').config({ path: './.env' })
const express = require('express');
const cors = require('cors');

const PORT = 3005;

const app = express();

const userRouter  = require('./routes/user');
const adminRouter  = require('./routes/admin');

const Admin = require('./Utils/Admin');

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use('/api/', cors(), userRouter);
app.use('/api/admin', cors(),Admin.initUserMiddleware, adminRouter);

app.get('/api/health-check', function (req, res) {
    res.status(200).send('OK');
});

app.get('/api*', function(req, res){
    res.status(404).send('page not found! 404');
});

app.listen(PORT, 'localhost',function () {
    console.log(`Express app listening on port ${PORT}!!`);
});

