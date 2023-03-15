var express = require('express');
var router = express.Router();

const auth = require('../controllers/account');
const notification = require('../utils/notification');

/* GET home page. */
router.get('/', function (req, res, next) {
  notification.send();
  res.render('index', { title: 'Express' });
});



module.exports = router;
