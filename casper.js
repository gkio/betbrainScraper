
var fs = require('fs');
var casper = require('casper').create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.172 Safari/537.22'
    }
});


var loginBetbrain = 'https://www.betbrain.com/sign-in/'
var nextMatchesUrl = 'http://betbrain.com/next-matches/football'


casper.on("page.error", function(msg, trace) {
    this.echo("Page Error: " + msg, "ERROR");
});


casper.options.onResourceRequested = function(C, requestData, request) {
  if ((/https?:\/\/.+?\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/css') {
    console.log('Skipping CSS file: ' + requestData['url']);
    request.abort();
    }
  }

casper.start()

casper.thenOpen(loginBetbrain,function(){
    console.log('login page loaded')
})

casper.then(function(){
    console.log("Login using username and password");
    this.evaluate(function(){
        document.getElementById("username").value="gkiora";
        document.getElementById("password").value="c84v475asd";
        document.getElementById("submitSignIn").click();
    });
});

casper.thenOpen(nextMatchesUrl, function() {
    var MatchNames = this.evaluate(getAllMatchesNames);
    var time = this.evaluate(function(){
        var getTime = $('#toolbar #optionsList li#timeChoice .OptionsText #timeUpdate').text()
        return getTime
    })
    this.echo(MatchNames);
    this.echo(time);
    function getAllMatchesNames(){
        var matchesLength = $('.TheMatch.LiveSoon').length
        var matchNamesObj = [];
        for(var i = 0; i < matchesLength;i++){
            var bookmakers = $('.TheMatch.LiveSoon:eq('+ i +')').find('div.MatchDetails .TotalBookies').text()
            var odds1 = $('.TheMatch.LiveSoon:eq('+ i +')').find(' ol.OddsList .Outcome1 .Bet .Odds').text()
            var odds2 = $('.TheMatch.LiveSoon:eq('+ i +')').find(' ol.OddsList .Outcome2 .Bet .Odds').text()
            var odds3 = $('.TheMatch.LiveSoon:eq('+ i +')').find(' ol.OddsList .Outcome3 .Bet .Odds').text()
            if(bookmakers > 75 && odds1 > 2.2 && odds2 > 2.2 && odds3 > 2.2){            
                var row = {}
                row.name = $('.TheMatch.LiveSoon:eq('+ i +')').find('div.MatchDetails .MDLink .MDxEventName').text()
                var date = new Date()
                row.link = 'https://www.betbrain.com' + ($('.TheMatch.LiveSoon:eq('+ i +')').find('div.MatchDetails .MDLink').attr('href')) + '1x2/full-time-excluding-overtime/?only=true&_=' + +date
                row.strt_time = $('.TheMatch.LiveSoon:eq('+ i +')').find('div.MatchDetails .MDLink .Setting.DateTime').text()
                row.strt_time = row.strt_time.substr(row.strt_time.length - 5)
                row.bookmakers = $('.TheMatch.LiveSoon:eq('+ i +')').find('div.MatchDetails .TotalBookies').text()
                matchNamesObj.push(row)
            }
        }
        return matchNamesObj
    }
        var jsonFile = './matches/filzxceNew.json'
        fs.write(jsonFile, JSON.stringify(MatchNames));

});

// casper.thenOpen('http://phantomjs.org', function() {
//     this.echo(this.getTitle());
// });

casper.run();