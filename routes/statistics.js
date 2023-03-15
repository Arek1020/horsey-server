var express = require('express');
var router = express.Router();
var controller = require('../controllers/statistics');


router.post('/newUsersPerMonths', function (req, res, next) {
    controller.newUsersPerMonths({})
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})

router.post('/usersActivityPerDays', function (req, res, next) {
    controller.usersActivityPerDays({})
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})

router.post('/usersType', function (req, res, next) {
    controller.usersType({})
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})




module.exports = router