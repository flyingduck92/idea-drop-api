import express from 'express'
import User from '../models/User.js'
import { logger } from '../utils/logger.js'

const authRoutes = express.Router()

// @route           GET /api/auth/register
// @description     Register new user
// @access          Public
authRoutes.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400)
      throw new Error('All fields are required')
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400)
      throw new Error('User  already exists.')
    }

    const user = await User.create({ name, email, password })
    logger.info({ userId: user._id }, 'User registered succesfully')
    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    logger.error(err, 'Registratuin error')
    next(err)
  }
})

export default authRoutes
