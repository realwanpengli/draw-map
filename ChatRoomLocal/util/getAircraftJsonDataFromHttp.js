var request = require("request")
var fs = require('fs');
var url = "https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json";
var ind = 1;
var saveJsonFun = function() {

	request({
	    url: url,
	    json: true
	}, function (error, response, body) {

	    if (!error && response.statusCode === 200) {
	        // console.log(body) // Print the json response
	        console.log('get json ok');
	     	var strJson = JSON.stringify(body);
	     	fs.writeFile('./json1/aircraft-'+ ind+'.json', strJson, 'utf8', function(err) {
	     		if (!err) {
		     		console.log('saving json ok');
		     		ind++;
		     	} else {
		     		console.log('saving json error');
		     	}
	     	});
	    } else {
	    	console.log('get json error');
	    }
	});
}


setInterval(saveJsonFun, 10*1000);


