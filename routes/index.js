import express from 'express'
import IdeaRoutes from './ideaRoutes.js'

const mainApiRoutes = express.Router()
const base = '/api'

mainApiRoutes.use(`${base}/ideas`, IdeaRoutes)

export default mainApiRoutes
