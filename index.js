import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mainApiRoutes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import connectDB from './config/db.js'
import pinoHttp from 'pino-http'
import { logger } from './utils/logger.js'

dotenv.config()

const app = express()

// connect to Mongodb
connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(pinoHttp({ logger }))

// main api routes
app.use(mainApiRoutes)

// 404 Fallback
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
})

app.use(errorHandler)

const port = process.env.PORT || 8000
app.listen(port, () => {
  logger.info(`App listen http://localhost:${port}`)
})
