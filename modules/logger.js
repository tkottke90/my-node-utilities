const { createLogger, format, transports } = require("winston");
const path = require('path');

MEGABYTE = 1000000;

class Logger {
  customList = [ 'fatal', 'error', 'warn', 'access', 'info', 'http', 'verbose', 'debug', 'silly', 'setup' ];

  constructor(instanceName = 'app', customLevels = []) {
    if (Array.isArray(customLevels) && customLevels.length > 0) {
      this.customList = customLevels;
    }
    
    this.baseInstance = instanceName;
    this.logger = createLogger({
      level: 'verbose',
      levels: this._generateLogLevels(this.customList),
      format: format.combine(
        format.timestamp(),
        format.simple(),
        format.printf((info) => {
          const message = info.message;
          delete info.message;

          info.instance = info.instance || instanceName;

          return `${info.timestamp} | ${info.level} | ${info.instance} | ${message} ${JSON.stringify(info)}`;
        })
      ),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: path.join(process.cwd(), 'logs', 'server.log'),
          maxsize: MEGABYTE
        })
      ]
    });
  }

  log(...args) {
    const log = this._parseLogInput(...args);
    this.logger.log(...log);
  };

  
  classLogger(instanceName) {
    return {
      log: (...args) => {
        const parsedArgs = this._parseLogInput(...args);
        const lastArg = parsedArgs.pop() || {};
        
        lastArg.instance = instanceName;
        
        this.logger.log(...args, lastArg);
      },
      methodLogger: (methodName) => {        
        const _methodLogName = `${methodName}.${instanceName}.${this.baseInstance}`;
        
        return {
          log: (...args) => {
            const parsedArgs = this._parseLogInput(...args);
            let [level, message, lastArg] = parsedArgs
            
            lastArg = lastArg || {};
            lastArg.instance = _methodLogName;
            
            this.logger.log(level, message, lastArg);
          }
        }
      }
    }
  }
  
  httpLog = (req, res, next) => {
    this.logger.log('http', `${req.method} ${req.originalUrl}`);
    next();
  }

  updateLogLevel = (req, res) => {
    let { level, transport } = req.body;

    try {
      this._updateLogLevel(level, transport);

      res.status(200).json({ message: 'Levels updated successfully', level, transport: transport || 'all' });
    } catch (error) {
      res.status(400).json({ message: `Bad Request: ${error.message}`, level, transport });
    }
  }

  /**
   * 
   * @param {Error} error 
   * @returns {{ message: string, name: string, stack?: string [] }}
   */
  parseErrorException(error) {

  }

  _updateLogLevel(newLevel, transport) {
    if (!this.logger.levels[newLevel]) {
      throw new Error('Invalid Level');
    }

    if (!transport || transport === 'all') {
      this.logger.level = newLevel;
      return this.logger.transports.forEach(transport => {
        transport.level = newLevel;
      })
    }

    const selectedTransport = this.logger.transports.find(t => t.name === transport);
    if (selectedTransport) {
      selectedTransport.level = newLevel;
    } else {
      throw new Error('Invalid Transport');
    }
  }

  _parseLogInput(...args) {
    const [ level, message, details, ...rest ] = args;

    if (rest.length > 0) {
      details.details = rest;
    }

    return [ level, message, details ];
  }

  _generateLogLevels = (list) => {
    if (!Array.isArray(list)) {
      console.error('Logger.js - Custom Log Levels Must Be An Array!');
      process.exit(1);
    }

    return list.reduce( (acc, cur, index) => Object.assign(acc, { [cur]: index }), {});
  }
}

module.exports = {
  Logger
};