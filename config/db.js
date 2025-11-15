import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI)
    logger.info(`Mongodb connected: ${db.connection.host}`)
  } catch (error) {
    logger.error(error, `MongoDB connection error`)
    process.exit(1)
  }
}

export default connectDB
