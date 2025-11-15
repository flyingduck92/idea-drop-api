import express from 'express'
import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
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

    // create token
    const payload = { userId: user._id.toString() }
    const accessToken = await generateToken(payload, '1m')
    const refreshToken = await generateToken(payload, '30d')

    // set refresh token in http-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // days * hours * minutes * seconds * miliseconds
    })

    return res.status(201).json({
      accessToken,
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

// @route           GET /api/auth/logout
// @description     Logout user and clear refresh token
// @access          Private
authRoutes.post('/logout', async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  })

  logger.info('Logout succesfully')
  res.status(200).json({ message: 'Logout succesfully' })
})

export default authRoutes
