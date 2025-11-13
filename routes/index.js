import express from 'express'
import IdeasRoutes from './ideasRoutes.js'

const mainApiRoutes = express.Router()
const base = '/api'

mainApiRoutes.use(`${base}/ideas`, IdeasRoutes)

export default mainApiRoutes
