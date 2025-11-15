import express from 'express'
import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { logger } from '../utils/logger.js'
import { jwtVerify } from 'jose'
import { JWT_SECRET } from '../utils/getJWTSecret.js'

const authRoutes = express.Router()

// @route           POST /api/auth/register
// @description     Register new user
// @access          Public
authRoutes.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {}

    if (!name || !email || !password) {
      res.status(400)
      throw new Error('All fields are required')
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400)
      throw new Error('User already exists.')
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
    logger.error(err, 'Registration error')
    next(err)
  }
})

// @route           POST /api/auth/logout
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

// @route           POST /api/auth/login
// @description     Login user, add generateToken and refresh token
// @access          Public
authRoutes.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {}

    if (!email || !password) {
      res.status(400)
      throw new Error('Email and password are required')
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401) // unauthorized
      throw new Error('Invalid Credentials.')
    } else {
      const isMatch = await user.matchPassword(password)
      if (!isMatch) {
        res.status(401) // password not match
        throw new Error('Invalid Credentials.')
      }

      // Create token if isMatch
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

      logger.info('Login succesfully')
      return res.status(201).json({
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      })
    }
  } catch (err) {
    logger.error('Invalid Credentials')
    next(err)
  }
})

// @route           POST /api/auth/refresh
// @description     Generate a brand new accessToken from refreshToken
// @access          Public (Need valid refreshToken in cookie)
authRoutes.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    console.log('Refreshing token...')

    if (!token) {
      res.status(401)
      throw new Error('No refresh token')
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)

    const user = await User.findById(payload.userId)

    if (!user) {
      res.status(401)
      throw new Error('No User')
    }

    const newAccessToken = await generateToken(
      { userId: user._id.toString() },
      '1m'
    )

    return res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    res.status(401)
    logger.error('Unauthorized')
    next(err)
  }
})

export default authRoutes
