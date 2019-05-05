var express = require('express');
var router = express.Router();
var User = require('../models/user');
var College = require('../models/college');
var Review = require('../models/review');
var Request = require('../models/request');
var mongoose = require('mongoose');

// function ensuring no one can directly browse to following pages.

function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg','Please login first');
		res.redirect('/users/login');
	}
}

// Admin Section

// Addition of college representative

router.get('/addcr', ensureAuthenticated, function(req, res) {
	res.render('addcr', {layout: 'layout3'});
});

router.post('/addcr', function(req, res) {
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validations
	req.checkBody('name','Name is required').notEmpty();
	req.checkBody('username','Username is required').notEmpty();
    req.checkBody('email','Email is required').notEmpty();
    req.checkBody('email','Email is not valid').isEmail();
    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password2','Password not matched').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors) {
    	res.render('addcr', {errors: errors, layout: layout3});
    } else {
    	var newUser = new User( {
    		name: name,
    		username: username,
    		email: email,
    		password: password,
    		reason: 1
    	});

    	User.createUser(newUser, function(err, user) {
    		if(err) throw err;
    		console.log(user);
    	});

    	req.flash('success_msg', 'College Representative added Successfully');

    	res.redirect('/users/home');
    }
});

// Addition of Admin

router.get('/addadmn', ensureAuthenticated, function(req, res) {
	res.render('addadmn', {layout: 'layout3'});
});

router.post('/addadmn', function(req, res) {
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validations
	req.checkBody('name','Name is required').notEmpty();
	req.checkBody('username','Username is required').notEmpty();
    req.checkBody('email','Email is required').notEmpty();
    req.checkBody('email','Email is not valid').isEmail();
    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password2','Password not matched').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors) {
    	res.render('addadmn', {errors: errors, layout: 'layout3'});
    } else {
    	var newUser = new User( {
    		name: name,
    		username: username,
    		email: email,
    		password: password,
    		reason: 3
    	});

    	User.createUser(newUser, function(err, user) {
    		if(err) throw err;
    		console.log(user);
    	});

    	req.flash('success_msg', 'Admin added Successfully');

    	res.redirect('/users/home');
    }
});

//Admin Profile

router.get('/profile3', ensureAuthenticated, function(req, res) {
	res.render('profile3', {layout: 'layout3'});
});

//Changing Password

router.get('/changePassword3', ensureAuthenticated, function(req, res) {
	res.render('chpswd3', {layout: 'layout3'});
});

router.post('/changePassword3', function(req, res) {
	var nps = req.body.npassword;
	var nps2 = req.body.npassword2;

	req.checkBody('npassword','Please fill Password').notEmpty();
	req.checkBody('npassword2','Passwords do not match').equals(req.body.npassword);

	var errors = req.validationErrors();

	if(errors) {
		res.render('chpswd3', {layout: 'layout3', errors: errors});
	} else {
		User.updatePassword(req.user, nps, function(err, user) {
			if(err) throw err;
			console.log(user);
		});
		req.flash('success_msg', 'Password Updated Successfully');

    	res.redirect('/users/home');
	}
});

// Requests Handling

router.get('/requests', ensureAuthenticated, function(req, res) {
	var rq = [];
	Request.getRequests(function(err, cursor) {
		if(err) throw err;
		if(cursor) {
			cursor.forEach(function(doc, er) {
				if(doc.validity==false) {
					rq.push(doc);
				}
			}, res.render('rqst', {layout: 'layout3', rq: rq}));
		}
	});
});

router.get('/valid/:cname', function(req, res) {
	var cname = req.params.cname;
	Request.returnRequest(cname, function(err, rqss) {
		if(err) throw err;
		if(rqss) {
			var newCollege = new College({
				name: rqss.cname,
				crname: rqss.name,
				location: rqss.location,
				engg: rqss.engg,
				med: rqss.med,
				mgmt: rqss.mgmt,
				about: '',
				modeOfAdmission: '',
				placements: ''
			});

			College.addCollege(newCollege, function(err, college) {
				if(err) throw err;
				Request.validateRequest(cname, function(errr) {
					if(errr) throw errr;
					req.flash('success_msg', 'College added Successfully');
    	            res.redirect('/inside/requests');
				});
			});
		}
	});
});

router.get('/remove/:cname', function(req, res) {
	var cname = req.params.cname;
	Request.removeCollegeByName(cname, function(err, college) {
		if(err) throw err;
		else {
			req.flash('success_msg','College Removed');
			res.redirect('/inside/requests');
		}
	});
});

// User Section

router.get('/review', ensureAuthenticated, function(req, res) {
	var Names = [];
	College.getCollegeNames(function(err,cursor) {
		if(err) throw err;
		if(cursor) {
			cursor.forEach(function(doc, err) {
				Names.push(doc);
			}, res.render('review', {layout: 'layout2', Names: Names}));
		}
	});
});

router.post('/review', ensureAuthenticated, function(req, res) {
	var name = req.body.name;
	var cname = req.body.cname;
	var cid = req.body.cid;
	var infra = req.body.infra;
	var fac = req.body.faculty;
	var place = req.body.place;
	var oth = req.body.other;

	 req.checkBody('cid','College ID is required').notEmpty();
	 req.checkBody('name','Name is required').notEmpty();
	 req.checkBody('infra','Please fill the infrastructure field').notEmpty();
	 req.checkBody('faculty','Please fill the faculty field').notEmpty();
     req.checkBody('place','Please fill the placements field').notEmpty();
	 req.checkBody('other','Please fill the Others field').notEmpty();

	var errors = req.validationErrors();

	if(errors) {
		var Names = [];
	    College.getCollegeNames(function(err,cursor) {
		  if(err) throw err;
		  if(cursor) {
		    	cursor.forEach(function(doc, err) {
			  	  Names.push(doc);
		        }, res.render('review', {layout: 'layout2', Names: Names, errors: errors}));
		  }  
	    });
	    
	} else {
		var newReview = new Review({
			name: name,
			cname: cname,
			cid: cid,
			infra: infra,
			fac: fac,
			place: place,
			oth: oth,
			validity: false
		});

		Review.addReview(newReview, function(err, review) {
			if(err) throw err;
			console.log(review);
		});

		req.flash('success_msg', 'Your Review was Successfully Submitted');

		res.redirect('/users/home');
	}
});

//User Profile

router.get('/profile2', ensureAuthenticated, function(req, res) {
	res.render('profile2', {layout: 'layout2'});
});

//Changing Password

router.get('/changePassword2', ensureAuthenticated, function(req, res) {
	res.render('chpswd2', {layout: 'layout2'});
});

router.post('/changePassword2', function(req, res) {
	var nps = req.body.npassword;
	var nps2 = req.body.npassword2;

	req.checkBody('npassword','Please fill Password').notEmpty();
	req.checkBody('npassword2','Passwords do not match').equals(req.body.npassword);

	var errors = req.validationErrors();

	if(errors) {
		res.render('chpswd2', {layout: 'layout3', errors: errors});
	} else {
		User.updatePassword(req.user, nps, function(err, user) {
			if(err) throw err;
			console.log(user);
		});
		req.flash('success_msg', 'Password Updated Successfully');

    	res.redirect('/users/home');
	}
});

// College Representative Section

// Addition of College

router.get('/addcollg', ensureAuthenticated, function(req, res) {
	res.render('addcollg', {layout: 'layout1'});
});

router.post('/addcollg', function(req, res) {
	var cname = req.body.name;
	var loc = req.body.location;
	var engg = req.body.engg;
	var med = req.body.med;
	var mgmt = req.body.mgmt;

	req.checkBody('name','College Name is Required').notEmpty();
	req.checkBody('location', 'Location is Required').notEmpty();

	var errors = req.validationErrors();

	if(errors) {
		res.render('addcollg', {errors: errors, layout: 'layout1'});
	} else {
		var newRequest = new Request({
			name: req.user.name,
			cname: cname,
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

    	res.redirect('/users/home');
	}
});

// Seeing College Page

router.get('/vcrcollg', ensureAuthenticated, function(req, res) {
	var reviews = [];
	College.getCollegeByCRName(req.user.name, function(err, college) {
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

// Editing College Details.

router.get('/collg', ensureAuthenticated, function(req, res) {
	College.getCollegeByCRName(req.user.name, function(err, college) {
		if(err) throw err;
		if(college) {
			res.render('collg', {clg: college, layout: 'layout1'});
		} else {
			req.flash('error_msg', 'No College Found');

    	    res.redirect('/users/home');
		}
	});
});

router.post('/collg', function(req, res) {
	College.getCollegeByCRName(req.user.name, function(err, college) {
		if(err) throw err;
		if(college) {
			college.about = req.body.about;
			college.modeOfAdmission = req.body.moa;
			college.placements = req.body.place;
			college.save(function(errr, updatedCollege) {
				if(errr) throw errr;
				else {
					console.log(college);
					req.flash('success_msg', 'Details Updated Successfully');

					res.redirect('/users/home');
				}
			});
		} else {
			req.flash('error_msg', 'No College Found');

    	    res.redirect('/users/home');
		}
	});
});

// Verification of Reviews

router.get('/veri', ensureAuthenticated, function(req, res) {
	var det = [];
	College.getCollegeByCRName(req.user.name, function(err, college) {
		if(err) throw err;
		if(college) {
			Review.getReviewsByCollege(college.name, function(er, cursor) {
				if(er) throw er;
				if(cursor) {
					cursor.forEach(function(doc, errr) {
						if(doc.validity == false) {
							det.push(doc);
						}
					},res.render('veri', {layout: 'layout1', det: det}));
				}
			});
		}
	});
});

// Validating review

router.get('/validate/:cid', function(req, res) {
	var cid = req.params.cid;
	Review.validateReview(cid, function(err, review) {
		if(err) throw err;
		if(review) {
			review.validity = true;
			review.save(function(errr, updatedReview) {
				if(errr) throw errr;
				else {
					req.flash('success_msg', 'Review Validated');
			        res.redirect('/inside/veri');
				}
			});
		}
	});
});

// Removing a Review
router.get('/invalid/:cid', function(req, res) {
	var cid = req.params.cid;
	Review.removeReviewByID(cid, function(err, review) {
		if(err) throw err;
		else {
			req.flash('success_msg','Review Removed');
			res.redirect('/inside/veri');
		}
	});
});

// Showing reviews

router.get('/reviewcr', function(req, res) {
	var reviews = [];
	College.getCollegeByCRName(req.user.name, function(er, college) {
		if(er) throw er;
		if(college) {
			Review.getReviewsByCollege(college.name, function(err, cursor) {
				if(err) throw err;
				if(cursor) {
					cursor.forEach(function(doc, e) {
						if(doc.validity==true) {
							reviews.push(doc);
						}
					}, res.render('reviewcr', {layout: 'layout1', reviews: reviews}));
				}
			});
		}
	});
});

//CR Profile

router.get('/profile1', ensureAuthenticated, function(req, res) {
	res.render('profile1', {layout: 'layout1'});
});

//Changing Password

router.get('/changePassword1', ensureAuthenticated, function(req, res) {
	res.render('chpswd1', {layout: 'layout1'});
});

router.post('/changePassword1', function(req, res) {
	var nps = req.body.npassword;
	var nps2 = req.body.npassword2;

	req.checkBody('npassword','Please fill Password').notEmpty();
	req.checkBody('npassword2','Passwords do not match').equals(req.body.npassword);

	var errors = req.validationErrors();

	if(errors) {
		res.render('chpswd1', {layout: 'layout1', errors: errors});
	} else {
		User.updatePassword(req.user, nps, function(err, user) {
			if(err) throw err;
			console.log(user);
		});
		req.flash('success_msg', 'Password Updated Successfully');

    	res.redirect('/users/home');
	}
});
module.exports = router;