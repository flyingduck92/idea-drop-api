import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mainApiRoutes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import connectDB from './config/db.js'

dotenv.config()

const app = express()

// connect to Mongodb
connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
  console.log(`App listen http://localhost:${port}`)
})
