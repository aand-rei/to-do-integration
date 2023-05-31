const Admin = require('../Utils/Admin');

const express = require('express');
const router = express.Router();

router.put('/tasks/:id', async (req, res) => {

    let admin = new Admin(req);
    let result = await admin.updateTask(req);

    res.send(result);

});



module.exports = router;
