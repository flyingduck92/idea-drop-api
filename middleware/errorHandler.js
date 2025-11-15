import { logger } from '../utils/logger.js'

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500
  res.status(statusCode)

  // Logger error with pino
  logger.error(
    {
      statusCode,
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    },
    'An error occured'
  )

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
}
