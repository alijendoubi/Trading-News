import winston from 'winston';
import { env } from './env.js';
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston.addColors(colors);
const format = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`));
const transports = [
    // Console transport
    new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize({ all: true }), format),
    }),
    // Error log file
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format,
    }),
    // Combined log file
    new winston.transports.File({
        filename: 'logs/combined.log',
        format,
    }),
];
export const logger = winston.createLogger({
    level: env.log_level,
    levels,
    format,
    transports,
});
//# sourceMappingURL=logger.js.map