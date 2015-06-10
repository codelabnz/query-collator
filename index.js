var collator = require('./collator');

var instance = new collator();
var args = [];
//get the files to process, we assume that it's after the main node args and not the last argument as that's the output file
process.argv.forEach(function(val,index,array) {
  if (index > 1 && index < process.argv.length-1) {
    args.push(val);
  }
});
instance.run(args,process.argv[process.argv.length-1]);
