import jwt from 'jsonwebtoken';

export function generateToken(userId, email) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function buildTokenCookie(token) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  return `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function buildClearCookie() {
  return `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
