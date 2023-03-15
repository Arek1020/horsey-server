var express = require('express');
var router = express.Router();
const reportController = require('../controllers/report');

router.post('/send', function (req, res, next) {
    req.body.user = req.body.user || res.locals.user.id
    req.body.userName = res.locals.user.name

    reportController.update(req.body).then((result) => {
        return res.json(result);
    }).catch((error) => {
        console.log(error)
        return res.sendStatus(500)
    })
});

router.post('/update', function (req, res, next) {
    req.body.user = req.body.user || res.locals.user.id
    req.body.userName = res.locals.user.name
    req.body.update = true
    reportController.update(req.body).then((result) => {
        return res.json(result);
    }).catch((error) => {
        console.log(error)
        return res.sendStatus(500)
    })
});

router.post('/get', function (req, res, next) {
    req.body.user = req.body.user || res.locals.user.id
    reportController.get(req.body).then((result) => {
        return res.json(result);
    }).catch((error) => {
        console.log(error)
        return res.sendStatus(500)
    })
});

module.exports = router;
