
var express = require('express');
var router = express.Router();
const nutritionController = require('../controllers/nutrition');
const userController = require('../controllers/user');
const multer = require('multer');
const tools = require('../utils/tools');
const mailer = require('../utils/mailer');




router.post('/update', function (req, res, next) {
    req.body.user = res.locals.user.id
    nutritionController.update(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})

router.post('/get', function (req, res, next) {
    nutritionController.get(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})

module.exports = router;
