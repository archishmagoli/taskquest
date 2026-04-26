const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.SESSION_SECRET || 'dev_secret'

module.exports = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const { userId } = jwt.verify(auth.slice(7), JWT_SECRET)
    req.user = { id: userId }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
