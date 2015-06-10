var readLine = require('linebyline');
var fs = require('fs');
var collatorObject = require('./collatorobject');
var resultObject = require('./result');

function Collator() {
  this.result = new resultObject();
  this.currentPos = 1;
  this.files = [];
  this.outputFile = '';
};

//Main entry point and kick off the first file
Collator.prototype.run = function(files, outputFile) {
  this.files = files;
  this.outputFile = outputFile;
  this.processFile(this.files[this.currentPos-1], this.fileEndCallBack.bind(this));
};

//File callback, this will check if we have finished all the files or continue to the next file
Collator.prototype.fileEndCallBack = function() {
  console.log('file has ended', this.result);
  if (this.currentPos != this.files.length) {
    this.currentPos++;
    this.processFile(this.files[this.currentPos-1], this.fileEndCallBack.bind(this));
  }
  else {
    this.results();
  }
};

//Process the file, read each line
Collator.prototype.processFile = function(f, callback) {
  var _this = this;
  var rl = readLine('./' + f);

  rl.on('line', function(line,lineCount,byteCount) {
    //get the first line in the first file
    if (lineCount == 1 && _this.currentPos == 1) _this.processHeaderLine(line);
    _this.processLine(line);
  })
  .on('error', function(e) {
    throw e;
  })
  .on('end', function(e) {
    callback();
  });
};

Collator.prototype.results = function() {
  console.log('writing contents to file', this.result);
  //write the contents to the file
  fs.writeFile(this.outputFile,JSON.stringify(this.result));
};

//Process each line, check if the line has a  property name the same as in the search params, increase the count
Collator.prototype.processLine = function(line) {

  this.result.lineTotal++;

  //split and clean the line
  var result = this.splitLine(line);

  for (var i=0;i<result.length;i++) {
    result[i] = this.cleanUpLine(result[i]);
  }

  //go through the objects and find the same property
  for (var i=0;i<this.result.searchParams.length;i++) {
    for (var x=0;x<result.length;x++) {
      //try and match the property name
      if (this.result.searchParams[i].name == result[x]) {
        //if the value is not 0, null, '', -1 or False
        var value = result[x+1];
        //based on default values
        if ((!isNaN(value) && parseInt(value) > 0)
            || (isNaN(value) && value != 'null' && value !== '' && value != 'False' && value != 'All' && value != 'AllInvoiced')
            ) {

          this.result.searchParams[i].used++;
        }
      }
    }
  }
};

//Process the header line
Collator.prototype.processHeaderLine = function(line) {
  //split up the line based on
  var result = this.splitLine(line);

  for (var i=0;i<result.length;i++) {
    result[i] = this.cleanUpLine(result[i]);
  }

  var startPosition = this.findStartPosition(result);

  for (var x=startPosition;x<result.length;x+=2) {
    this.result.searchParams.push(new collatorObject(result[x]));
  }
};

//split based on the :
Collator.prototype.splitLine = function(line) {
  return line.split(/(\w+(?=[:]))/g);
}
//remove all the fluff
Collator.prototype.cleanUpLine = function(line) {
  return line.split(':').join('').split('}').join('').split(',').join('').split('"').join('').trim();
};

Collator.prototype.findStartPosition = function(array) {
  var startPos = 0;

  for (var i=0;i<array.length;i++) {
    if (array[i].indexOf('{') > -1) {
      startPos = i+1;
    }
  }

  return startPos;
}

module.exports = Collator;
