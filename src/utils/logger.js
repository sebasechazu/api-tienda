import { createLogger, format as _format, transports as _transports } from 'winston';

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
    format: _format.json(),
    transports: [
        ...(process.env.NODE_ENV !== 'production' ? [
            new _transports.Console({
                format: _format.simple(),
            }),
            new _transports.File({ filename: 'combined.log', maxsize: 5242880, maxFiles: 5 }),
        ] : [
            new _transports.File({ filename: 'error.log', level: 'error', maxsize: 5242880, maxFiles: 5 })
        ])
    ],
});

export default logger;

