let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('./session');
let indexRouter = require('./routes');
let passport = require('passport');
let vhost = require('vhost');
let httpErrors = require('http-errors');

require('./auth')();

let app = express();
let helmet = require('helmet');
app.use(helmet());

// Redirect app

// var redirect = express();
//
// redirect.use(function(req, res){
//   if (!module.parent) console.log(req.vhost);
//   res.redirect('http://myapp.com:3000/' + req.vhost[0]);
// });
//
// // Vhost app
//
// var virtualHost = module.exports = express();
//
// virtualHost.use(vhost('*.myapp.com', redirect)); // Serves all subdomains via Redirect app
// virtualHost.use(vhost('myapp.com', app)); // Serves top level domain via Main server app

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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
