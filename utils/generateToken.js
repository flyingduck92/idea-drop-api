import { SignJWT } from 'jose'
import { JWT_SECRET } from './getJWTSecret.js'

/*
 * Generates a JWT
 * @params {Object} payload - Data to embed in the token
 * @params {string} expiresIn - Expiration time (e.g: '15m','7d','30d')
 */

export const generateToken = async (payload, expiresIn = '15m') => {
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET)
}
