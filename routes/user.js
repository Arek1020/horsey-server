var express = require('express');
var router = express.Router();
const userController = require('../controllers/user');
const eventController = require('../controllers/event');
const reportController = require('../controllers/report');
const riderController = require('../controllers/rider');
const multer = require('multer');
const accountController = require('../controllers/account');
const mailer = require('../utils/mailer');

var imageUploadPath = process.env.dirname + '/public/uploads';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('ff111', file)

    try {
      if (file.fieldname == 'avatar')
        return cb(null, imageUploadPath + '/avatars');
      cb(null, imageUploadPath)
    }
    catch (err) { console.log(err) }
  },
  filename: function (req, file, cb) {
    try {
      cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
    }
    catch (err) { console.log(err) }
  }
})

const imageUpload = multer({ storage: storage })

/* GET users listing. */
router.post('/get', function (req, res, next) {
  userController.get({ email: res.locals.user.email, all: req.body.all, id: req.body.id }).then((result) => {

    return res.json(result);
  }).catch((error) => {
    console.log(error)
    return res.sendStatus(500)
  })
});

router.post('/update', function (req, res, next) {
  req.body.id = req.body.id || res.locals.user.id
  userController.update(req.body).then((result) => {

    return res.json(result);
  }).catch((error) => {
    console.log(error)
    return res.sendStatus(500)
  })
});

router.post('/avatar/upload', imageUpload.single("avatar"), function (req, res, next) {
  try {
    userController.update({ id: res.locals.user.id, logo: req.file.filename })
    res.send('POST request recieved on server to /image-upload.');
  }
  catch (err) { console.log(err) }
});

router.post('/report/send', function (req, res, next) {
  req.body.user = req.body.user || res.locals.user.id
  req.body.userName = res.locals.user.name

  reportController.update(req.body).then((result) => {
    return res.json(result);
  }).catch((error) => {
    console.log(error)
    return res.sendStatus(500)
  })
});

router.post('/report/get', function (req, res, next) {
  req.body.user = req.body.user || res.locals.user.id
  reportController.get(req.body).then((result) => {
    return res.json(result);
  }).catch((error) => {
    console.log(error)
    return res.sendStatus(500)
  })
});

router.post('/activity/update', function (req, res, next) {
  req.body.user = req.body.user || res.locals.user.id
  userController.updateActivity(req.body).then((result) => {

    return res.json(result);
  }).catch((error) => {
    console.log(error)
    return res.sendStatus(500)
  })
});

router.post('/events/get', async function (req, res, next) {
  eventController.getDatesForSpecificEventsForRider({ horse: req.body?.id, user: res.locals.user.id })
      .then((result) => {
          return res.json(result)
      })
      .catch((err) => {
          console.log(err)
          return res.json({ err: true, message: err.message })
      })
})


module.exports = router;
