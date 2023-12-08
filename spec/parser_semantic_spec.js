const Course = require('../Course');
const Timeslot = require('../Timeslot');
const Schedule = require('../Schedule');
const { compare } = require('vega');

describe("Program Semantic testing of Schedule, Timeslot, Course", function(){
	
	beforeAll(function() {
		//1,C1,P=62,H=J 09:00-10:00,F1,S=B101//
		this.s = new Schedule("L", "08:50","15:00")
		this.t = new Timeslot("1,C1", "62", this.s,"F1","B101")
		this.c = new Course("AP03",[this.t])
	});
	
	it("can create a new Timeslot", function(){
		
		expect(this.t).toBeDefined();
		// toBe is === on simple values
		expect(this.t.room).toBe("B101");
		expect(this.t.capacity).toBe("62");
		expect(this.t).toEqual(jasmine.objectContaining({
			type: '1,C1',
			capacity: '62',
			schedule: new Schedule("L", "08:50","15:00"),
			subgroup: 'F1',
			room: 'B101'
		  }));
		
	});
	
	it("can create a new Course", function(){
		
		expect(this.c).toBeDefined();
		// toEqual is === on complex values - deepEquality
		expect(this.c.course_code).toBe("AP03");
		expect(this.c).toEqual(jasmine.objectContaining({course_code: "AP03",timeslots:[jasmine.objectContaining({
			type: '1,C1',
			capacity: '62',
			schedule: jasmine.objectContaining({ day: 'L', start: '08:50', end: '15:00' }),
			subgroup: 'F1',
			room: 'B101'
		  })]}));
		
	});

	it("can add a timeslot to a course", function(){
		
		// toEqual is === on complex values - deepEquality
		const tempTimeslot = new Timeslot("1,C1", "62", new Schedule("V","10:00","12:00"),"F1","B101")
		this.c.add(tempTimeslot)
		expect(this.c).toEqual(jasmine.objectContaining({course_code: "AP03",timeslots:[jasmine.objectContaining({
			type: '1,C1',
			capacity: '62',
			schedule: jasmine.objectContaining({ day: 'L', start: '08:50', end: '15:00' }),
			subgroup: 'F1',
			room: 'B101'
		  }),
		  jasmine.objectContaining({
			type: '1,C1',
			capacity: '62',
			schedule: jasmine.objectContaining({ day: 'V', start: '10:00', end: '12:00' }),
			subgroup: 'F1',
			room: 'B101'
		  })
		  
		]}));

		
	})

	it("compare 2 schedule", function(){
		
		const tempTimeslot = new Timeslot("1,C1", "62", new Schedule("L","16:00","18:00"),"F1","B101")
		// toEqual is === on complex values - deepEquality
		let timeslots = [tempTimeslot,this.t]
		timeslots.sort((ts1,ts2) => {
			return ts1.compareSchedule(ts2)
		})
		expect(timeslots[0]).toEqual(jasmine.objectContaining(this.t));
		
	});

	
});