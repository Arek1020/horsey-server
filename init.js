require('dotenv').config({ path: __dirname + '/config.env' })
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
process.env.dirname = __dirname;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const schedule = require('node-schedule')

const indexRouter = require('./routes/index');
const accountRouter = require('./routes/account');
const userRouter = require('./routes/user');
const horsesRouter = require('./routes/horse');
const calendarRouter = require('./routes/calendar');
const nutritionRouter = require('./routes/nutrition');
const statisticsRouter = require('./routes/statistics');
const reportRouter = require('./routes/report');

const eventController = require('./controllers/event')

var authMiddleware = require('./middleware/authentication');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('*', function (req, res, next) {
  // if (req.headers.origin == 'https://7vzojexaqq' || req.headers.origin == 'http://7vzojexaqq' || req.headers.origin == 'ionic://7vzojexaqq') {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.headers['access-control-request-headers'])
    return res.end()
  // }

  return next();
})
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

try {

  app.use('/', indexRouter);
  app.use(['/', '/account'], accountRouter);
  app.use('/user', authMiddleware.requireToken, userRouter);
  app.use('/horse', authMiddleware.requireToken, horsesRouter);
  app.use('/calendar', authMiddleware.requireToken, calendarRouter);
  app.use('/nutrition', authMiddleware.requireToken, nutritionRouter);
  app.use('/stats', authMiddleware.requireToken, statisticsRouter);
  app.use('/report', authMiddleware.requireToken, reportRouter);
} catch (e) {
  console.log('eeeeeee', e)
}
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var reminderRule = new schedule.RecurrenceRule()
reminderRule.hour = 9
reminderRule.minute = 20
reminderRule.second = 0

schedule.scheduleJob(reminderRule, eventController.autoReminder)
    
// eventController.autoReminder();

module.exports = app;
