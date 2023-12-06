const fs = require('fs');
const colors = require('colors');
const CRUParser = require('./CRUParser.js');

const vg = require('vega');
const vegalite = require('vega-lite');

const cli = require("@caporal/core").default;


//TODO dans ce fichier, il faut créer une commande par spécification
// on peut laisser la fonction readme 

cli
	.version('cru-parser-cli')
	.version('1.0')
	// check CRU
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
			
			logger.debug(analyzer.parsedPOI);

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

	// search
	.command('search', 'Free text search on POIs\' name')
	.argument('<file>', 'The CRU file to search')
	.argument('<needle>', 'The text to look for in POI\'s names')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new CRUParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){
		
			// Filtre à ajouter //
			let poiAFiltrer = analyzer.parsedPOI;
			poiAFiltrer = poiAFiltrer.filter(p => p.name.match(args.needle, 'i'));
			logger.info("%s", JSON.stringify(poiAFiltrer, null, 2));
			// Filtre à ajouter //
			
		}else{
			logger.info("The .cru file contains error".red);
		}
		
		});
	})


	// average
	.command('average', 'Compute the average note of each POI')
	.alias('avg')
	.argument('<file>', 'The CRU file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new VpfParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){

			var avg = analyzer.parsedPOI.map(p => {
				var m = 0	
				// compute the average for each POI
				if(p.ratings.length > 0){
					m = p.ratings.reduce((acc, elt) => acc + parseInt(elt), 0) / p.ratings.length;
				}
				p["averageRatings"] = m;
				return p;
			})
			logger.info("%s", JSON.stringify(avg, null, 2));
			
		}else{
			logger.info("The .cru file contains error".red);
		}
		
		});
	})	

	// abc
	.command('abc', 'Organize POI in an Object grouped by name')
	.argument('<file>', 'The CRU file to group by')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new VpfParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){

			var abc = analyzer.parsedPOI.reduce(function(acc, elt){
				var idx = elt.name.charAt(0);
				if(acc[idx]){
					acc[idx].push(elt);
				}else{
					acc[idx] = [elt];
				}
				return acc;
			}, {})

			logger.info("%s", JSON.stringify(abc, null, 2));
			
		}else{
			logger.info("The .cru file contains error".red);
		}
		
		});
	})
	

	
	// average with chart
	.command('averageChart', 'Compute the average note of each POI and export a Vega-lite chart')
	.alias('avgChart')
	.argument('<file>', 'The Cru file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new CRUParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){

			var avg = analyzer.parsedPOI.map(p => {
				var m = 0	
				// compute the average for each POI
				if(p.ratings.length > 0){
					m = p.ratings.reduce((acc, elt) => acc + parseInt(elt), 0) / p.ratings.length;
				}
				p["averageRatings"] = m;
				return p;
			})
			
			var avgChart = {
				//"width": 320,
				//"height": 460,
				"data" : {
						"values" : avg
				},
				"mark" : "bar",
				"encoding" : {
					"x" : {"field" : "name", "type" : "nominal",
							"axis" : {"title" : "Restaurants' name."}
						},
					"y" : {"field" : "averageRatings", "type" : "quantitative",
							"axis" : {"title" : "Average ratings for "+args.file+"."}
						}
				}
			}
			
			
			
			const myChart = vegalite.compile(avgChart).spec;
			
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
			logger.info("The .vpf file contains error".red);
		}
		
		});
	})	
	
cli.run(process.argv.slice(2));
	