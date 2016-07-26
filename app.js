var watch = require('node-watch');

var watcher = watch('matches')

watch('matches',function(filename){
	console.log(filename, ' added')
})

watcher.on('change', function(file) {
  console.log(file, ' changed') 
});