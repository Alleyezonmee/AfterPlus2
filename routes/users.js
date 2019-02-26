var express = require('express');
var router = express.Router();
var User = require('../models/user');
var College = require('../models/college');
var Review = require('../models/review');
var Request = require('../models/request');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

// Home
router.get('/index', function(req, res) {
	res.render('index');
});

//Requests

router.get('/cr', function(req, res) {
	res.redirect('/users/register');
});

router.post('/cr', function(req, res) {
	var name = req.body.name;
	var cname = req.body.cname;
	var email = req.body.email;
	var loc = req.body.location;
	var engg = req.body.engg;
	var med = req.body.med;
	var mgmt = req.body.mgmt;

	req.checkBody('name','Name Field cannot be empty').notEmpty();
	req.checkBody('cname','College Name Field cannot be empty').notEmpty();
	req.checkBody('email','Email Field cannot be empty').notEmpty();
	req.checkBody('email','Invalid Email').isEmail();
	req.checkBody('location','Address Field cannot be empty').notEmpty();

	var errors = req.validationErrors();

	if(errors) {
		res.render('cradd', {errors: errors});
	} else {
		newRequest = new Request({
			name: name,
			cname: cname,
			email: email,
			location: loc,
			engg: engg,
			med: med,
			mgmt: mgmt,
			validity: false
		});

		Request.addRequest(newRequest, function(err, rqst) {
			if(err) throw err;
			console.log(rqst);
		});

		req.flash('success_msg', 'Your request has been submitted. You will be soon notified');

    	res.redirect('/users/cr');
	}
});

// Registration
router.get('/register', function(req, res) {
	res.render('register');
});

router.post('/register', function(req, res) {
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var reason = req.body.reason;

	// Validations
	req.checkBody('name','Name is required').notEmpty();
	req.checkBody('username','Username is required').notEmpty();
    req.checkBody('email','Email is required').notEmpty();
    req.checkBody('email','Email is not valid').isEmail();
    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password2','Password not matched').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors) {
    	res.render('register', {errors: errors});
    } else {
    	var newUser = new User( {
    		name: name,
    		username: username,
    		email: email,
    		password: password,
    		reason: reason
    	});

    	User.createUser(newUser, function(err, user) {
    		if(err) throw err;
    		console.log(user);
    	});

    	req.flash('success_msg', 'You are registered and can now login');

    	res.redirect('/users/login');
    }
});

// Login
router.get('/login', function(req, res) {
	res.render('login');
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByUsername(username, function(err, user) {
			if(err) throw err;
			if(!user) {
				return done(null, false, {message: 'Unknown User'});
			}

			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {message: 'Invalid Password'});
				}
			});
		});
	}));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

router.post('/login',
  passport.authenticate('local', {successRedirect: '/users/home', failureRedirect:'/users/login', failureFlash: true}),
  function(req, res) {
    res.redirect('/users/home');
  });

//Logout

router.get('/logout', function(req,res) {
  req.logout();
  clname = null;
  req.flash('success_msg','You are logged out');

  res.redirect('/users/login');
});

router.get('/home', ensureAuthenticated, function(req, res) {
	if(req.user.reason==1) {
		College.getCollegeByCRName(req.user.name, function(err, college) {
			if(err) throw err;
			if(college) {
				res.render('home1', {layout: 'layout1', clg:college});
			} else {
				res.render('home1', {layout: 'layout1', clg:null});
			}
		});
	} else if(req.user.reason==2) {
		var Names = [];
	    College.getCollegeNames(function(err,cursor) {
		  if(err) throw err;
		    if(cursor) {
			  cursor.forEach(function(doc, err) {
			    	Names.push(doc);
			  },res.render('home2', {layout: 'layout2', Names: Names}));
		   }
	    });
	} else {
		res.render('home3', {layout: 'layout3'});
	}
});

function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg','Please login first');
		res.redirect('/users/login');
	}
}

// Medical Colleges
router.get('/medcollg', function(req, res) {
	var c_array = [];
	College.returnMedicalColleges(function(err, cursor) {
		if(err) throw err;
		if(cursor) {
			cursor.forEach(function(doc, errr) {
					c_array.push(doc);
			}, res.render('medcollg', {clgs: c_array}));
		}
	});
});

// Engineering Colleges
router.get('/engcollg', function(req, res) {
	var c_array = [];
	College.returnEngineeringColleges(function(err, cursor) {
		if(err) throw err;
		if(cursor) {
			cursor.forEach(function(doc, errr) {
				//if(errr) throw errr;
				//else 
					c_array.push(doc);
				//}
			},res.render('engcollg', {clgs: c_array}));
		}
	});
});


// Management Colleges
router.get('/mgmtcollg', function(req, res) {
	var c_array = [];
	College.returnManagementColleges(function(err, cursor) {
		if(err) throw err;
		if(cursor) {
			cursor.forEach(function(doc, errr) {
					
					c_array.push(doc);
			}, res.render('mgmtcollg', {clgs: c_array}));
		}
	});
});

router.get('/viewcollg/:cname', function(req,res) {
	var cname = req.params.cname;
	var reviews = [];
	College.getCollegeByName(cname, function(err, college) {
		if(err) throw err;
		if(college) {
			Review.getReviewsByCollege(college.name, function(er, cursor) {
				if(er) throw er;
				if(cursor) {
					cursor.forEach(function(doc, e) {
						if(doc.validity==true) {
							reviews.push(doc);
						}
					}, res.render('college', {college: college, layout: 'blank', reviews: reviews}));
				}
			});
		} else {
			console.log('Not Found');
		}
	});
});

module.exports = router;