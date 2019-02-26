var mongoose = require('mongoose');

var reviewSchema = mongoose.Schema({
	name: {
		type: String
	},
	cname: {
		type: String
	},
	cid: {
		type: String
	},
	infra: {
		type: String
	},
	fac: {
		type: String
	},
	place: {
		type: String
	},
	oth: {
		type: String
	},
	validity: {
		type: Boolean
	}
});

var Review = module.exports = mongoose.model('Review', reviewSchema);

module.exports.addReview = function(newReview, callback) {
	newReview.save(callback);
}

module.exports.getReviewsByCollege = function(cname, callback) {
	var query = {cname: cname};
	Review.find(query,callback);
}

module.exports.validateReview = function(cid, callback) {
	var query = {cid: cid};
	Review.findOne(query, callback);
}

module.exports.removeReviewByID = function(cid, callback) {
	Review.deleteOne({cid: cid}, callback);
}