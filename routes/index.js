import express from 'express'
import ideaRoutes from './ideaRoutes.js'
import authRoutes from './authRoutes.js'

const mainApiRoutes = express.Router()
const base = '/api'

mainApiRoutes.use(`${base}/ideas`, ideaRoutes)
mainApiRoutes.use(`${base}/auth`, authRoutes)

export default mainApiRoutes
