// Generated by CoffeeScript 1.3.3
var deprecated;

deprecated = function(message) {
  this.shown || (this.shown = {});
  if (!this.shown[message]) {
    this.shown[message] = true;
    return process.stderr.write(message);
  }
};

module.exports = {
  deprecated: deprecated.bind(deprecated)
};