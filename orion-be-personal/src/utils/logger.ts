import { createLogger, format, transports } from 'winston';

// Setup logger config.
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'orion' },
  transports: [
    new transports.File({ filename: './src/logs/quick-start-error.log', level: 'error' }),
  ],
});

// Give additional formatter if current environtment not production.
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export default logger;
