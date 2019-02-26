// Required Variables 
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

mongoose.connect('mongodb://paras:p9p9p9p9p@ds125385.mlab.com:25385/cool1', {useNewUrlParser: true});
var db = mongoose.connection;

// Routes for our app

var routes = require('./routes/index');
var users = require('./routes/users');
var inside = require('./routes/inside');

// Init App

var application = express();

// View Engine (Using Handlebars)

application.set('views', path.join(__dirname, 'views'));
application.engine('handlebars', exphbs({ defaultLayout: 'layout'}));
application.set('view engine','handlebars');

// Body Parsers
application.use(bodyParser.json());
application.use(bodyParser.urlencoded({extended: false}));
application.use(cookieParser());

// Defining folder for views

application.use(express.static(path.join(__dirname, 'public')));

// Express Sessions

application.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// Passport for authentication

application.use(passport.initialize());
application.use(passport.session());

// Express Validator

application.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Flash for displaying alerts

application.use(flash());

// Global Variables

application.use(function(req,res,next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
  res.locals.clname = null;
	next();
});

//Routes

application.use('/', routes);
application.use('/users', users);
application.use('/inside', inside);

/*// Port

application.set('port', (process.env.port || 8080));

application.listen(application.get('port'), function() {
	console.log('Server Started on '+application.get('port'));
});*/
module.exports = application;