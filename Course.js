var Schedule = require('./Schedule');
var Timeslot = require('./Timeslot');

var Course = function(code, timeslots){
	this.course_code = code;
	this.timeslots = timeslots
}

Course.prototype.getCode = function(){
	return this.course_code;
};

Course.prototype.getTimeslots = function(){
	return this.timeslots;
};

Course.prototype.create = function(){
	//TODO
};

Course.prototype.add = function(timeslot){
	this.timeslots.push(timeslot)
};

Course.prototype.remove = function(timeslot){
	this.timeslots = this.timeslots.filet((ts) => {
		return ts != timeslot;
	})
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