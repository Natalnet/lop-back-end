const express = require('express')
//const User = require('../models/user')
const router = express.Router();
const authMiddeleware = require('../middlewares/auth')

router.use(authMiddeleware);

router.get('/', (req, res) =>{
    res.send({ok: true, user: req.userId});
});

module.exports = app => app.use('/projects', router);
