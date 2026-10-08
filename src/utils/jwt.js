import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

/**
 * El payload NUNCA incluye password ni datos sensibles.
 */
export const generateToken = (user) =>
  jwt.sign(
    {
      id: String(user._id ?? user.id),
      email: user.email,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

export const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

export const cookieExtractor = (req) => {
  if (req && req.cookies) return req.cookies[config.jwt.cookieName] || null;
  return null;
};

export const cookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
};
