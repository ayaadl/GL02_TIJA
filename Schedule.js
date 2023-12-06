var Schedule = function(day, start, end){
	this.day = day;
	
	//Format dates : HH:MM
	this.start = start;
	this.end = end;
}
	
Schedule.prototype.getDay = function(){
	return this.day;
};

Schedule.prototype.getStartTime = function(){
	return this.start;
};

Schedule.prototype.getEndTime = function(){
	return this.end;
};

Schedule.prototype.create = function(){
	return this.day;
};

Schedule.prototype.compare = function(){
//TODO 
};

module.exports = Schedule;
