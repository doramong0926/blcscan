const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');

const web3Control = require('./models/web3/web3control');

const index_router = require('./routes/index');
const api_router = require('./routes/api');
const ico_api_router = require('./routes/ico_api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// log level setting
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Set web3 default value
web3Control.InitializeWeb3();

app.use('/', index_router);
app.use('/api', api_router);
app.use('/api/ico', ico_api_router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
