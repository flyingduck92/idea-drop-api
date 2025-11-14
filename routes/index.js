import express from 'express'
import ideaRoutes from './ideaRoutes.js'

const mainApiRoutes = express.Router()
const base = '/api'

mainApiRoutes.use(`${base}/ideas`, ideaRoutes)

export default mainApiRoutes
