var Schedule = require('./Schedule');
 

var Timeslot = function(type, capacity, schedule, subgroup, room){
	this.type = type;
	this.capacity = capacity;
	this.schedule = schedule;
	this.subgroup = subgroup;
	this.room = room; 
};

Timeslot.prototype.getType = function(){
	return this.type;
};

Timeslot.prototype.getCapacity = function(){
	return this.capacity;
};

//TODO voir le comportement de cette fonction comme Schedule est un autre type de classe et qu'il se peut qu'il faille en appeler les sous-fonctions 
Timeslot.prototype.getSchedule = function(){
	return this.schedule;
};

Timeslot.prototype.getSubgroupIndex = function(){
	return this.subgroup;
};

Timeslot.prototype.getRoomName = function(){
	return this.room;
};

Timeslot.prototype.equals= function(){
	//TODO en checkant avec le CDC 
};

Timeslot.prototype.compareSchedule= function(timeslot){
	return this.schedule.compare(timeslot.schedule)
};

module.exports = Timeslot;


