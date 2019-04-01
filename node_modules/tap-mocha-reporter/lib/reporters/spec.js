/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color
  , util = require('util')

/**
 * Expose `Spec`.
 */

exports = module.exports = Spec;

/**
 * Initialize a new `Spec` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Spec(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , indents = 0
    , n = 0;

  function indent() {
    return Array(indents).join('  ')
  }

  runner.on('start', function(){
    process.stdout.write('\n')
  });

  runner.on('suite', function(suite){
    ++indents;
    var fmt = color('suite', '%s%s');
    process.stdout.write(util.format(fmt, indent(), suite.title))
    process.stdout.write('\n')
  });

  runner.on('suite end', function(suite){
    --indents;
    if (1 == indents) process.stdout.write('\n');
  });

  runner.on('pending', function(test){
    var fmt = indent() + color('pending', '  - %s');
    process.stdout.write(util.format(fmt, test.title))
    process.stdout.write('\n')
  });

  runner.on('pass', function(test){
    if ('fast' == test.speed) {
      var fmt = indent()
        + color('checkmark', '  ' + Base.symbols.ok)
        + color('pass', ' %s');
      cursor.CR();
      process.stdout.write(util.format(fmt, test.title))
      process.stdout.write('\n')
    } else {
      var fmt = indent()
        + color('checkmark', '  ' + Base.symbols.ok)
        + color('pass', ' %s')
        + color(test.speed, ' (%dms)');
      cursor.CR();
      process.stdout.write(util.format(fmt, test.title, test.duration))
      process.stdout.write('\n')
    }
  });

  runner.on('fail', function(test, err){
    cursor.CR();
    var fmt = indent() + color('fail', '  %d) %s');
    process.stdout.write(util.format(fmt, ++n, test.title))
    process.stdout.write('\n')
  });

  runner.on('end', self.epilogue.bind(self));
}

/**
 * Inherit from `Base.prototype`.
 */

Spec.prototype.__proto__ = Base.prototype;
