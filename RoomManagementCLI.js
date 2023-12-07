const fs = require('fs');
const colors = require('colors');
const CRUParser = require('./CRUParser.js');
const vg = require('vega');
const vegalite = require('vega-lite');
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
	// TODO modifier pour faire la occupancy rate - mal compris 
	// Modification uniquement au niveau des data pas besoin de toucher au reste, juste renommer les variables dans les charts
	.command('room_occupancy', 'Generate a visualization for the rooms occupancy rates export a Vega-lite chart')
	.alias('avgOccupancy')
	.argument('<file>', 'The Cru file to use')
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
				day: timeslot.schedule.day
				};
			});
	

			var occupancyChart = {
				"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
				"data": {
					"values": values 
				},
				"mark": "bar",
				"encoding": {
					"x": {"field": "day", "type": "ordinal", "axis": {"title": "Day"}},
					"y": {"field": "capacity", "type": "quantitative", "aggregate": "average", "axis": {"title": "Average occupancy rates"}},
					"color": {"field": "room", "type": "nominal", "legend": {"title": "Room"}},
					"column": {"field": "room", "type": "nominal", "title": "Room"}
				}		  
			}
			  		
			const myChart = vegalite.compile(occupancyChart).spec;

			/* SVG version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('svg').run();
			var mySvg = view.toSVG();
			mySvg.then(function(res){
				fs.writeFileSync("./result.svg", res)
				view.finalize();
				logger.info("%s", JSON.stringify(myChart, null, 2));
				logger.info("Chart output : ./result.svg");
			});
			
			/* Canvas version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result.png", res.toBuffer());
				view.finalize();
				logger.info(myChart);
				logger.info("Chart output : ./result.png");
			})	
			
		}else{
			logger.info("The .cru file contains error".red);
		}
		
		});
	})

	// room_capacities || SPEC6
	//TODO amélioration : gestion de l'écart des axes d'abscices et ordonnées 
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
				logger.info("%s", JSON.stringify(myChart, null, 2));
				logger.info("Chart output : ./result_roomsByCapacity.svg");
			});
			
			/* Canvas version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result_roomsByCapacity.png", res.toBuffer());
				view.finalize();
				logger.info(myChart);
				logger.info("Chart output : ./result_roomsByCapacity.png");
			})	
			
		}else{
			logger.info("The .cru file contains error".red);
		}
		
		});
	})
	
cli.run(process.argv.slice(2));
	