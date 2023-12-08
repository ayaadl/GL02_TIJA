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


Schedule.prototype.compare = function(schedule){
const days = ["L","MA","ME","J","V","S","D"]
	const thisScheduleTime = {
		start:{
			hours:parseInt(this.start.split(":")[0]),
			minutes:parseInt(this.start.split(":")[1]),
		},
		end:{
			hours:parseInt(this.end.split(":")[0]),
			minutes:parseInt(this.end.split(":")[1]),
		}
	}
	const scheduleTime = {
		start:{
			hours:parseInt(schedule.start.split(":")[0]),
			minutes:parseInt(schedule.start.split(":")[1]),
		},
		end:{
			hours:parseInt(schedule.end.split(":")[0]),
			minutes:parseInt(schedule.end.split(":")[1]),
		}
	}
	if(days.indexOf(this.day) - days.indexOf(schedule.day) == 0){
		if(thisScheduleTime.start.hours - scheduleTime.start.hours == 0){
			return thisScheduleTime.start.minutes - scheduleTime.start.minutes
		}else{
			return thisScheduleTime.start.hours - scheduleTime.start.hours
		}
	}else{
		return days.indexOf(this.day) - days.indexOf(schedule.day);
	}

};

module.exports = Schedule;
