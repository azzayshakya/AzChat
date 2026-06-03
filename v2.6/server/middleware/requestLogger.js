// middleware/requestLogger.js

const morgan = require('morgan');
const chalk = require('chalk');

module.exports = morgan((tokens, req, res) => {
  return [
    chalk.blue(tokens.method(req, res)),
    chalk.yellow(tokens.url(req, res)),
    chalk.green(tokens.status(req, res)),
    chalk.magenta(tokens['response-time'](req, res) + ' ms'),
  ].join(' ');
});
