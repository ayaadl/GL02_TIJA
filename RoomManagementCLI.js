const fs = require('fs');
const colors = require('colors');
const CRUParser = require('./CRUParser.js');
const vg = require('vega');
const vegalite = require('vega-lite');
const Timeslot = require('./Timeslot.js');
const Schedule = require('./Schedule.js');
const cli = require("@caporal/core").default;


cli
	.version('cru-parser-cli')
	.version('1.0')
	// check - check CRU file 
	.command('check', 'Check if <file> is a valid CRU file')
	.argument('<file>', 'The file to check with CRU parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new CRUParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			
			if(analyzer.errorCount === 0){
				logger.info("The .cru file is a valid cru file".green);
			} else{
				logger.info("The .cru file contains error".red);
			}

			logger.debug(analyzer.parsedCourse);
		});
			
	})
	
	// readme 
	.command('readme', 'Display the README.txt file')
	.action(({args, options, logger}) => {
		fs.readFile("README.txt", 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}
			else {
				logger.info(data)
			}
		});
	})

	// search_room || SPEC1 
	.command('search_room', 'Search rooms of a specific course ')
	.argument('<file>', 'The CRU file to search')
	.argument('<needle>', 'The text to look for in course\'s names')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new CRUParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){
			let courseSearched = analyzer.parsedCourse;
			courseSearched = courseSearched.filter(p => p.getCode().match(args.needle, 'i'));
			
			if(courseSearched.length > 0 ){ 
				let formattedTimeslots = courseSearched[0].timeslots.map(timeslot => {
					let { room, schedule } = timeslot;
					let day = schedule.day;
					switch (day) {
					case "L":
						day = "Monday"
						break;
					case "MA":
						day = "Tuesday"
						break;
					case "ME":
						day = "Wednesday"
						break;
					case "J":
						day = "Thursday"
						break;
					case "V":
						day = "Friday"
						break;
					case "S":
						day = "Saturday"
						break;
					case "D":
						day = "Sunday"
						break;
					default:
						day = "undefined"
					}					
					return `Room : ${room} | Schedule : ${day}, from ${schedule.start} to ${schedule.end}`;
				});				
				logger.info(`The course ${args.needle} takes place on these timselots : \n ${formattedTimeslots.join(' \n ')}`.yellow);

			}else{
				logger.info("The course does not exist or does not have a timeslot".red)
			}
		}else{
			logger.info("The .cru file contains error".red);
		}
		
		});
	})
	//SPEC 2
	.command("getMaximumCapacityRoom", "Display the maximum capacity of a room")
	.alias("getMaxCapRoom")
	.argument("<file>", "The Cru file to use")
	.argument("<room>", "The room you want to check")
	.action(({ args, options, logger }) => {
	  console.log(args.room)
	  fs.readFile(args.file, "utf8", function (err, data) {
		if (err) {
		  return logger.warn(err);
		} else {
		  logger.info("super".green);
		  var analyzer = new CRUParser(options.showTokenize, options.showSymbols);
		  analyzer.parse(data);
  
		  if (analyzer.errorCount === 0) {
			  let max = 0;
			analyzer.parsedTimeslot.forEach((ts) => {
			  if(ts.room == args.room){
				  if(ts.capacity > max){
					  max = ts.capacity;
				  }
			  }
			})
			if(max > 0){
			  return logger.info(("La salle " + args.room + " à une capacité maximum de " +max).green);
			}else{
			  return logger.warn("salle inexistante".red);
			}
		  } else {
			logger.info("The .cru file contains error".red);
		  }
		  logger.info(data);
		}
	  });
	})

	.command("searchFreeSlot", "Display the slots available for a room")
    .alias("searchFS")
    .argument("<file>", "The Cru file to use")
    .argument("<room>", "The romm you want to check")
    .action(({ args, options, logger }) => {
      fs.readFile(args.file, "utf8", function (err, data) {
        if (err) {
          return logger.warn(err);
        } else {
          var analyzer = new CRUParser(options.showTokenize, options.showSymbols);
          analyzer.parse(data);
  
          if (analyzer.errorCount === 0) {
            const days = ["L","MA","ME","J","V","S","D"]

            let dayTimeSlots = analyzer.parsedTimeslot.filter((ts) => {
                return ts.room == args.room
            })

            dayTimeSlots = dayTimeSlots.sort((ts1,ts2) => {
				let schedule1 = ts1.schedule;
				let schedule2 = ts2.schedule;
				if(days.indexOf(schedule1.day) - days.indexOf(schedule2.day) == 0){
					console.log("1",schedule1.start, schedule2.start)
					if(schedule1.start > schedule2.start){
						return 1
					}else if(schedule1.start < schedule2.start){
						return -1
					}else{
						return 0
					}
				}else{
					return days.indexOf(schedule1.day) - days.indexOf(schedule2.day)
				}
                
            })

            console.log(dayTimeSlots)
			let resSlots = []
			days.forEach((jour) => {
				let timeslotsJour = dayTimeSlots.filter((ts) => {
					return ts.schedule.day == jour
				})
				if(timeslotsJour.length == 0){
					resSlots.push(new Timeslot("C1",10,new Schedule(jour,"08:00","20:00"),"F1",args.room))
				}else{
					if(timeslotsJour[0].schedule.start > "08:00"){
						resSlots.push(new Timeslot("C1",10,new Schedule(jour,"08:00",timeslotsJour[0].schedule.start),"F1",args.room))
					}

					timeslotsJour.forEach((ts,index) => {
						if(index < timeslotsJour.length-1){
							if(ts.schedule.end < timeslotsJour[index+1].schedule.start){
								resSlots.push(new Timeslot("C1",10,new Schedule(jour,ts.schedule.end,timeslotsJour[index+1].schedule.start),"F1",args.room))

							}
						}
					})

					if(timeslotsJour[timeslotsJour.length -1].schedule.end < "20:00"){
						resSlots.push(new Timeslot("C1",10,new Schedule(jour,timeslotsJour[timeslotsJour.length -1].schedule.end,"20:00"),"F1",args.room))
					}
				}

			})

			console.log(JSON.stringify(resSlots))
			return logger.info(`The room ${args.room} is free on these timselots : \n ${resSlots.join(' \n ')}`.yellow);
          } else {
            logger.info("The .cru file contains error".red);
          }
          logger.info(data);
        }
      });
    })

	// export || SPEC5
	.command('export', 'Export an iCalendar file between two given dates for a specific teaching')
	.argument('<startDate>', 'The first date')
	.argument('<endDate>', 'The first date')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new CRUParser();
		analyzer.parse(data);

		if(analyzer.errorCount === 0){
			//TODO 
			
		}else{
			logger.info("The .cru file contains error".red);
		}
		
		});
	})

	// room_occupancy || SPEC6
	.command('room_occupancy', 'Generate a visualization for the rooms occupancy rates export a Vega-lite chart')
	.argument('<file>', 'The Cru file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new CRUParser();
		analyzer.parse(data);
		if(analyzer.errorCount === 0){	

			let occupancy = {};
			analyzer.parsedTimeslot.forEach(timeslot => {
				let room = timeslot.room;
				let day = timeslot.schedule.day;
				let startTime = new Date('2023-01-01 ' + timeslot.schedule.start);
				let endTime = new Date('2023-01-01 ' + timeslot.schedule.end);
				let timeDifference = (endTime - startTime) / (1000 * 60 * 60);
				if (!occupancy[room]) {
					occupancy[room] = {};
				}
				if (!occupancy[room][day]) {
					occupancy[room][day] = 0;
				}
				occupancy[room][day] += timeDifference;
			});

			let values = []
		 	for (let room in occupancy) {
				for (let day in occupancy[room]) {
					values.push({
						room: room,
						day: day,
						occupancy: (occupancy[room][day]/12)*100
					});
				}
			}
			var occupancyChart = {
				"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
				"data": {
					"values": values 
				},
				"mark": "bar",
				"encoding": {
					"x": {"field": "day", "type": "ordinal", "axis": {"title": "Days"}},
					"y": {"field": "occupancy", "type": "quantitative", "axis": {"title": "Occupancy rates per day"},  "scale": {"domain": [0, 100]}},
					"color": {"field": "room", "type": "nominal", "legend": {"title": "Rooms"}},
					"column": {"field": "room", "type": "nominal", "title": "Rooms"}
				}		  
			}
			  		
			const myChart = vegalite.compile(occupancyChart).spec;

			/* SVG version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('svg').run();
			var mySvg = view.toSVG();
			mySvg.then(function(res){
				fs.writeFileSync("./resultOccupancy.svg", res)
				view.finalize();
				//logger.info("%s", JSON.stringify(myChart, null, 2));
				logger.info("Chart output : ./resultOccupancy.svg");
			});
			
			/* Canvas version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./resultOccupancy.png", res.toBuffer());
				view.finalize();
				//logger.info(myChart);
				logger.info("Chart output : ./resultOccupancy.png");
			})	
			
		}else{
			logger.info("The .cru file contains error".red);
		}
		
		});
	})

	// room_capacities || SPEC7
	.command('room_capacities', 'Generate a chart of room types by capacity')
	.alias('types')
	.argument('<file>', 'The CRU file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new CRUParser();
		analyzer.parse(data);


		if(analyzer.errorCount === 0){
			var values = analyzer.parsedTimeslot.map(function(timeslot) {
				return {
					capacity: timeslot.capacity,
					room: timeslot.room,
				};
			});
	
			var occupancyChart = {
				"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
				"data": {
					"values": values 
				},
				"mark": "bar",
				"encoding": {
					"x": {"field": "capacity", "type": "ordinal", "title": "Capacity" },
					"y": {"aggregate": "count", "type": "quantitative", "title": "Number of Rooms", "sort": {"field": "count", "order": "ascending"} }
				}	  
			}
			  		
			const myChart = vegalite.compile(occupancyChart).spec;

			/* SVG version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('svg').run();
			var mySvg = view.toSVG();
			mySvg.then(function(res){
				fs.writeFileSync("./result_roomsByCapacity.svg", res)
				view.finalize();
				//logger.info("%s", JSON.stringify(myChart, null, 2));
				logger.info("Chart output : ./result_roomsByCapacity.svg");
			});
			
			/* Canvas version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result_roomsByCapacity.png", res.toBuffer());
				view.finalize();
				//logger.info(myChart);
				logger.info("Chart output : ./result_roomsByCapacity.png");
			})	
			
		}else{
			logger.info("The .cru file contains error".red);
		}
		
		});
	})
	
cli.run(process.argv.slice(2));
	