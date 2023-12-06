var Course = require('./Course');
var Schedule = require('./Schedule');
var Timeslot = require('./Timeslot');

/*
Exemple de format CRU 

+ME05
1,C1,P=62,H=ME 12:00-16:00,F1,S=B101// 
1,D1,P=64,H=ME 16:00-20:00,F1,S=B101//

*/

// CRUParser
var CRUParser = function(sTokenize, sParsedSymb){
	// The list of Course parsed from the input file.
	this.parsedCourse = [];

	// TODO Check utilité de ces deux lignes
	this.parsedSchedule = [];
	this.parsedTimeslot = [];
	//

	this.symb = ["+",",","=", "P","H","S", "//"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// ##################################
// PARSER PROCEDURES 
// ##################################

// tokenize : tranform the data input into a list
// <eol> = CRLF
CRUParser.prototype.tokenize = function(data){
	var separator = /(\r|\n|,|=|\+|\/\/)/;
	data = data.split(separator).filter(car => car !== '');
	var filter = /(\r|\n|,|=| null)/;
	data = data.filter((val, idx) => !val.match(filter));
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
CRUParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.listCourse(tData);
}

// Parser operand
CRUParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
CRUParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS
}

// accept : verify if the arg s is part of the language symbols.
CRUParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}
	return idx;
}

// check : check whether the arg elt is on the head of the list
CRUParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
CRUParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		//console.log("Reckognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}


// ##################################
// PARSER RULES 
// ##################################

// <course> = +(<course>)
CRUParser.prototype.listCourse = function(input){
	this.course(input);
}

//<course> = "+" <name> <eol> <list_timeslot> <eol>
CRUParser.prototype.course = function(input){
	if(this.check("+", input)){
		this.expect("+", input);
		var args = this.body(input);

		var p = new Course(args.course_code, args.list_timeslot.timeslots);

		this.parsedCourse.push(p);
		if(input.length > 0){
			this.course(input);
		}

		/* A utiliser si besoin d'affichage
		console.log("######################")
		console.log(this.parsedCourse)
		console.log(this.parsedSchedule)
		console.log(this.parsedTimeslot)
		*/
		

		return true;
	}else{
		return false;
	}
}

// <body> = ‘+’ Code CRLF 1*Timeslot
CRUParser.prototype.body = function(input){
	var course_code = this.course_code(input);
	var list_timeslot = this.timeslot(input);

	return {course_code, list_timeslot};
}

// <course_code> = code  
CRUParser.prototype.course_code = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/[A-Z0-9]{4}/)){
		return matched[0];
	}else{
		this.errMsg("Invalid course code", input);
	}
} 

// <list_timeslot> = liste des séances 
CRUParser.prototype.timeslot = function(input){
	timeslots = [];
	do{
		var type = this.type(input);
		var capacity = this.capacity(input);
		var schedule = this.schedule(input);
		var subgroup = this.subgroup(input);
		var room = this.room(input);
		var next = this.next(input);
		var t = new Timeslot(type, capacity, schedule, subgroup, room);
		this.parsedTimeslot.push(t);
		timeslots.push(t);
	} while(next != "+" && input.length > 0);

	return {timeslots};
}

// <type> = DIGIT ‘,’ ALPHA DIGIT
CRUParser.prototype.type = function(input){
	var curS1 = this.next(input);
	var curS2 = this.next(input);

	if((matched1 = curS1.match(/[1-9]/)) && (matched2 = curS2.match(/[A-Z][1-9]/))){
		var type = matched1 + "," + matched2;
		return type;
	}else{
		this.errMsg("Invalid type", input);
	}
} 

// <capacity> = 'P=' 1*DIGIT
CRUParser.prototype.capacity = function(input){
	this.expect("P", input);
	var curS = this.next(input);

	if(matched = curS.match(/\d+/)){
		return matched[0];
	}else{
		this.errMsg("Invalid capacity", input);
	}
} 

// <schedule> = ‘H=’ <day> WSP <hour> 
CRUParser.prototype.schedule = function(input){
	this.expect("H", input);
	var curS = this.next(input);

	if(matched = curS.match(/(L|MA|ME|J|V|S|D) \d{1,2}:00-\d{1,2}:00/)){
		var s = new Schedule(matched[0].split(" ")[0], matched[0].split(" ")[1].split("-")[0], matched[0].split(" ")[1].split("-")[1]);
		this.parsedSchedule.push(s);
		return s;
	}else{
		this.errMsg("Invalid schedule", input);
	}
} 

// <subgroup> = ALPHA DIGIT
CRUParser.prototype.subgroup = function(input){
	var curS = this.next(input);

	if(matched = curS.match(/[A-Z][1-9]/)){
		return matched[0];
	}else{
		this.errMsg("Invalid subgroup", input);
	}
} 

// <room> = ‘S=’ ALPHA 3DIGIT
CRUParser.prototype.room = function(input){
	this.expect("S", input);
	var curS = this.next(input);
	if(matched = curS.match(/[A-Z0-9]{3}/)){
		return matched[0];
	}else{
		this.errMsg("Invalid room", input);
	}
} 

module.exports = CRUParser;