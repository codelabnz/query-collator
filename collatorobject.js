//used for each search params that will be tracked
function collatorobject(name) {
  this.name = name;
  this.used = 0;
};

module.exports = collatorobject;
