var watch = require('node-watch');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs')

watch('matches',function(filename){
	var Filename = './' + filename
	var matches = require(Filename)
	startLoop(matches)
})



function startLoop(matches){
	console.log('i am in startLoop')
	        matches.forEach(function(item,i){
						var localTime = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()
						var itemTime = item.strt_time;

						function toSeconds(time_str) {
						    // Extract hours, minutes and seconds
						    var parts = time_str.split(':');
						    // compute  and return total seconds
						    return parts[0] * 3600 + // an hour has 3600 seconds
						    parts[1] * 60 + // a minute has 60 seconds
						    +
						    parts[2]; // seconds
						}

						var difference = Math.abs(toSeconds(localTime) - toSeconds(itemTime));

						var result = [
						    Math.floor(difference / 3600), // an hour has 3600 seconds
						    Math.floor((difference % 3600) / 60), // a minute has 60 seconds
						    difference % 60
						];


						result = result.map(function(v) {
						    return v < 10 ? '0' + v : v;
						}).join(':');
						var differenceTime = result.split(':')
						if(differenceTime[0] == 0 && differenceTime[1] <= 15 && differenceTime[2] >= 10){
							console.log('match found')
							    setInterval(function(){
										parseMatch(item.link,item.name, function(json) {
			            		// console.log(json)
			            	})
    							}, 5000);

						}else{
							console.log('there is no matches to start yet')
						}
        });

}



function parseMatch(link,name, cb){
    console.log("parseMatch");
    request({
        url: link,
        jar:  true
    }, function(error, response, html){
        if(error) console.log(error);
        if(!error){
            var $ = cheerio.load(html);
            var website,asso,xi,diplo,aAvg,xAvg,dAvg;
            var json = {};
                var count =  $('ul[id*="rtf_m999d888_1_300"]').length;
                json['count'] = count;
                json['list'] = [];
                for (var i = 1; i < count+1; i++) {
                    var row = {};
                    row.website = $('#paramGroup-rtf_m999d888 ul:nth-child('+i+') .OTBookies .OTBH .OTBookieLink .OTBookie').text();
                    row.asso = $('#paramGroup-rtf_m999d888 ul:nth-child('+i+') .OTCol1 a').text().replace(/[^0-9.-]/g, '');
                    row.xi = $('#paramGroup-rtf_m999d888 ul:nth-child('+i+') .OTCol2 a').text().replace(/[^0-9.-]/g, '');
                    row.diplo = $('#paramGroup-rtf_m999d888 ul:nth-child('+i+') .OTCol3 a').text().replace(/[^0-9.-]/g, '');
                    json['list'].push(row);
                }
                // json['aAvg']  = $('#avg_rtf_m999d888 .OTCol1 a').text().replace(/[^0-9.-]/g, '');
                // json['xAvg']  = $('#avg_rtf_m999d888 .OTCol2 a').text().replace(/[^0-9.-]/g, '');
                // json['dAvg']  = $('#avg_rtf_m999d888 .OTCol3 a').text().replace(/[^0-9.-]/g, '');
                var file_match_name = name+'.json'
                var saveFileWhere = 'parsedMatches'
                var check_file = saveFileWhere + '/' + file_match_name
                fs.stat(check_file, function(err, stat) {
							    if(err == null) {
							    	var options = { flag : 'w' };
								    fs.writeFile(check_file,JSON.stringify(json), options, function(err) {
								        if (err) throw err;
								    });
							    } else if(err.code == 'ENOENT') {
							        // file does not exist
							        fs.writeFile(check_file,JSON.stringify(json),function(err){
			                	if (err) throw err;
			                })
							    } else {
							        console.log('Some other error: ', err.code);
							    }
							});
                cb(json);// что такое cb
        }
    });
}