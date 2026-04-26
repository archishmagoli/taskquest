const express = require('express')
const router = express.Router()
const pool = require('../config/database')

// GET user profile with equipped avatar
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT users.*, avatars.name AS avatar_name, avatars.image_url AS avatar_image
       FROM users
       LEFT JOIN user_avatars ON users.id = user_avatars.user_id AND user_avatars.is_equipped = TRUE
       LEFT JOIN avatars ON user_avatars.avatar_id = avatars.id
       WHERE users.id = $1`,
      [id]
    )
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
