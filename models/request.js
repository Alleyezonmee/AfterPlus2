var mongoose = require('mongoose');

var requestSchema = mongoose.Schema({
	name: {
		type: String
	},
	cname: {
		type: String
	},
	email: {
		type: String,
	},
	location: {
		type: String
	},
	engg: {
		type: Number,
		default: 0
	},
	med: {
		type: Number,
		default: 0
	},
	mgmt: {
		type: Number,
		default: 0
	},
	validity: {
		type: Boolean
	}
});

var Request = module.exports = mongoose.model('Request', requestSchema);

module.exports.addRequest = function(newRequest, callback) {
	newRequest.save(callback);
}

module.exports.getRequests = function(callback) {
	Request.find(callback);
}

module.exports.returnRequest = function(cname, callback) {
	var query = {cname: cname};
	Request.findOne(query,callback);
}

module.exports.validateRequest = function(cname, callback) {
	Request.updateOne({cname: cname}, {$set: {validity: true}}, callback);
}

module.exports.removeCollegeByName = function(cname, callback) {
	Request.deleteOne({cname: cname}, callback);
}