var mongoose = require('mongoose');

// College Schema

var collegeSchema = mongoose.Schema({
	name: {
		type: String
	},
	crname: {
		type: String
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
	about: {
		type: String
	},
	modeOfAdmission: {
		type: String
	},
	placements: {
		type: String
	}
});

var College = module.exports = mongoose.model('College', collegeSchema);

module.exports.addCollege = function(newCollege, callback){
	newCollege.save(callback);
}

module.exports.getCollegeByCRName = function(crname, callback) {
	var query = {crname: crname};
	College.findOne(query, callback);
}

module.exports.getCollegeByName = function(name, callback) {
	var query = {name: name};
	College.findOne(query, callback);
}

module.exports.getCollegeNames = function(callback) {
	College.find(callback);
}

module.exports.returnEngineeringColleges = function(callback) {
	College.find({engg: 1}, "name about", callback);
}

module.exports.returnMedicalColleges = function(callback) {
	College.find({med: 1}, "name about", callback);
}

module.exports.returnManagementColleges = function(callback) {
	College.find({mgmt: 1}, "name about", callback);
}