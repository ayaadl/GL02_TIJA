var Schedule = require('./Schedule');
var Timeslot = require('./Timeslot');

var Course = function(code, timeslots){
	this.course_code = code;
	this.timeslots = timeslots
}

// Fonctions qui n'étaient pas dans le CDC 
Course.prototype.getCode = function(){
	return this.course_code;
};

Course.prototype.getTimeslots = function(){
	return this.timeslots;
};

//

Course.prototype.create = function(){
	//TODO
};

Course.prototype.add = function(){
	//TODO
};

Course.prototype.remove = function(){
	//TODO
};

Course.prototype.member = function(){
	//TODO
};

Course.prototype.union = function(){
	//TODO
};

Course.prototype.intersection = function(){
	//TODO
};

Course.prototype.card = function(){
	//TODO
};

module.exports = Course;