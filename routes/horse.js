
var express = require('express');
var router = express.Router();
const horseController = require('../controllers/horse');
const userController = require('../controllers/user');
const eventController = require('../controllers/event');
const multer = require('multer');
const tools = require('../utils/tools');
const mailer = require('../utils/mailer');


var imageUploadPath = process.env.dirname + '/public/uploads';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('ff111', file, req)

        try {
            console.log('ff1')
            // if (file.fieldname == 'avatar')
            return cb(null, imageUploadPath + '/horses/');
            // cb(null, imageUploadPath + file.fieldname)
        }
        catch (err) { console.log(err) }
    },
    filename: function (req, file, cb) {
        console.log('ff22')

        try {
            console.log('ff12')

            cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
        }
        catch (err) { console.log(err) }
    }
})


const imageUpload = multer({ storage: storage })



router.post('/list', function (req, res, next) {
    res.end()
});

router.post('/update', function (req, res, next) {
    horseController.update(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})

router.post('/get', function (req, res, next) {
    horseController.get(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})

router.post('/image/upload', function (req, res, next) {
    try {
        let dir = process.env.dirname + '/public/uploads/horses/' + req.headers['horseid']
        tools.uploadFile(req, res, dir, 5 * 1024 * 1024, 'photo', function (fileName, body) {
            if (fileName.error)
                if (fileName.code == 'LIMIT_FILE_SIZE')
                    return res.send({ err: true, message: 'Za duży rozmiar pliku' })

            if (body?.type == 'primary')
                horseController.update({ id: body.id, primaryImage: '/horses/' + body.id + '/' + fileName })
            if (body?.type == 'second')
                horseController.update({ id: body.id, secondImage: '/horses/' + body.id + '/' + fileName })
            if (body?.type == 'third')
                horseController.update({ id: body.id, thirdImage: '/horses/' + body.id + '/' + fileName })
        })
        res.send('POST request recieved on server to /image-upload.');
    }
    catch (err) { console.log(err) }
});

router.post('/attached/update', async function (req, res, next) {
    const horseOwner = res.locals.user
    try {

        if (req.body.email == res.locals.user.email)
            return res.send({ err: true, message: 'Nie możesz dodać samego siebie' })
        var user = {}
        if (req.body.email)
            user = await userController.get({ email: req.body.email })

        let newUser = false

        if (!user.length && !req.body.update) {
            user = await userController.createUser({
                email: req.body.email,
                name: req.body.name,
                phone: req.body.phone
            })
            newUser = true;
        }

        await userController.attachHorse({
            user: req.body?.user || user[0]?.id,
            horse: req.body?.horse,
            color: req.body?.color,
            update: req.body?.update,
            active: req.body?.active,
            permissions: req.body?.permissions,
            type: req.body?.userType
        })

        const horse = await horseController.get({ id: req.body.horse })

        if (newUser)
            mailer.account_create({ email: req.body.email, creator: horseOwner })

        if (!req.body.update)
            mailer.user_attached({ email: req.body.email, horseOwner: horseOwner, rider: user[0], horse: horse[0], type: req.body?.userType })

        return res.json({ newUser });

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
});

router.post('/attached/get', function (req, res, next) {
    horseController.getAttachedUsers(req.body)
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})

router.post('/events/get', async function (req, res, next) {

    // var horse = await horseController.get(req.body)
    // req.body.horse = req.body?.id
    // req.body.user = res.locals.user.id
    eventController.getDatesForSpecificEvents({ horse: req.body?.id, user: res.locals.user.id })
        .then((result) => {
            return res.json(result)
        })
        .catch((err) => {
            console.log(err)
            return res.json({ err: true, message: err.message })
        })
})


module.exports = router;
