const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const pool = require('../config/database')

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${CLIENT_URL}/login` }),
  (req, res) => res.redirect(CLIENT_URL)
)

router.get('/me', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const { rows } = await pool.query(
      `SELECT users.*, avatars.name AS avatar_name, avatars.image_url AS avatar_image,
              COUNT(tasks.id) FILTER (WHERE tasks.is_completed = TRUE) AS tasks_completed
       FROM users
       LEFT JOIN user_avatars ON users.id = user_avatars.user_id AND user_avatars.is_equipped = TRUE
       LEFT JOIN avatars ON user_avatars.avatar_id = avatars.id
       LEFT JOIN tasks ON users.id = tasks.user_id
       WHERE users.id = $1
       GROUP BY users.id, avatars.name, avatars.image_url`,
      [req.user.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err)
    res.json({ message: 'Logged out' })
  })
})

module.exports = router
