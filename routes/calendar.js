
var express = require('express');
var router = express.Router();
const calendarController = require('../controllers/calendar');
const eventController = require('../controllers/event');
const tools = require('../utils/tools');

router.post('/calendars/get', async function (req, res, next) {
    req.body.email = res.locals.user.email
    req.body.user = res.locals.user.id

    await calendarController.sync(req.body)

    calendarController.get(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})

router.post('/calendars/update', function (req, res, next) {
    req.body.user = res.locals.user.id

    calendarController.update(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})


router.post('/events/get', function (req, res, next) {
    req.body.user = res.locals.user.id
    eventController.get(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})

router.post('/events/update', function (req, res, next) {
    req.body.user = res.locals.user.id

    eventController.update(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})





module.exports = router;
