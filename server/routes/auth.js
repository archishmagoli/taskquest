const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const pool = require('../config/database')
const jwt = require('jsonwebtoken')

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const JWT_SECRET = process.env.SESSION_SECRET || 'dev_secret'

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }))

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${CLIENT_URL}/login` }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.redirect(`${CLIENT_URL}?token=${token}`)
  }
)

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const { userId } = jwt.verify(auth.slice(7), JWT_SECRET)
    const { rows } = await pool.query(
      `SELECT users.*, avatars.name AS avatar_name, avatars.image_url AS avatar_image,
              COUNT(tasks.id) FILTER (WHERE tasks.is_completed = TRUE) AS tasks_completed
       FROM users
       LEFT JOIN user_avatars ON users.id = user_avatars.user_id AND user_avatars.is_equipped = TRUE
       LEFT JOIN avatars ON user_avatars.avatar_id = avatars.id
       LEFT JOIN tasks ON users.id = tasks.user_id
       WHERE users.id = $1
       GROUP BY users.id, avatars.name, avatars.image_url`,
      [userId]
    )
    res.json(rows[0])
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' })
})

module.exports = router
