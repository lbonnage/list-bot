import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const formatFile = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.prettyPrint(),
  winston.format.printf((info) => `${info.timestamp} ${info.moduleName} [${info.level}]: ${info.message}`),
);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.moduleName} [${info.level}]: ${info.message}`),
);

const transports = [
  new winston.transports.Console({ format }),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: formatFile,
  }),
  new winston.transports.File({ filename: 'logs/all.log', format: formatFile }),
];

const BaseLogger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

/**
 * Create an instance of a logger.
 * @param moduleName Module name to display in front of logging messages from this logger.
 * @constructor
 */
export const Logger = (moduleName: string): winston.Logger => {
  return BaseLogger.child({ moduleName });
};
