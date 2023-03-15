
var express = require('express');
var router = express.Router();

const accountController = require('../controllers/account');
const middleware = require('../middleware/authentication')


router.post('/signup', function (req, res, next) {
    if (req.body.stage)
        accountController.mobileSignUp(req.body, function (result) {
            return res.json(result)
        })
    else
        accountController.signup(req.body, function (result) {
            return res.json(result)
        })
});

router.post('/login', function (req, res, next) {
    accountController.signin(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
});

router.get('/activate', function (req, res, next) {
    accountController.activate(req.query, function (result) {
        res.render('activated', { title: 'Horsey', activation: result });
    })
});

router.post('/password/change', middleware.requireToken, function (req, res, next) {
    if (!req.body.password || !req.body.newPassword || !req.body.newPasswordClone)
        return res.send({ err: true, message: 'Brak hasła.' })
    accountController.changePassword(req.body, function (result) {
        return res.json(result)
    })
});

router.post('/password/reset', function (req, res, next) {
    if (!req.body.email)
        return res.send({ err: true, message: 'Nieprawidłowy adres email.' })
    accountController.resetPassword(req.body, function (result) {
        return res.json(result)
    })
});
module.exports = router;
