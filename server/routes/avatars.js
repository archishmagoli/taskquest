const express = require('express')
const router = express.Router()
const pool = require('../config/database')

// GET all avatars with unlock status for a user
router.get('/', async (req, res) => {
  const { user_id = 1 } = req.query
  try {
    const { rows } = await pool.query(
      `SELECT avatars.*,
        user_avatars.id AS user_avatar_id,
        user_avatars.is_equipped,
        user_avatars.unlocked_at,
        CASE WHEN user_avatars.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_unlocked
       FROM avatars
       LEFT JOIN user_avatars ON avatars.id = user_avatars.avatar_id AND user_avatars.user_id = $1
       ORDER BY avatars.point_cost ASC`,
      [user_id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST unlock an avatar (spend points)
router.post('/unlock', async (req, res) => {
  const { user_id = 1, avatar_id } = req.body
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [user_id])
    const avatarRes = await pool.query('SELECT * FROM avatars WHERE id = $1', [avatar_id])

    if (!userRes.rows.length) return res.status(404).json({ error: 'User not found' })
    if (!avatarRes.rows.length) return res.status(404).json({ error: 'Avatar not found' })

    const user = userRes.rows[0]
    const avatar = avatarRes.rows[0]

    const alreadyOwned = await pool.query(
      'SELECT id FROM user_avatars WHERE user_id = $1 AND avatar_id = $2',
      [user_id, avatar_id]
    )
    if (alreadyOwned.rows.length) return res.status(400).json({ error: 'Avatar already unlocked' })
    if (user.points < avatar.point_cost) return res.status(400).json({ error: 'Not enough points' })

    await pool.query('UPDATE users SET points = points - $1 WHERE id = $2', [avatar.point_cost, user_id])
    const { rows } = await pool.query(
      'INSERT INTO user_avatars (user_id, avatar_id, is_equipped) VALUES ($1, $2, FALSE) RETURNING *',
      [user_id, avatar_id]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH equip an avatar
router.patch('/equip/:avatar_id', async (req, res) => {
  const { avatar_id } = req.params
  const { user_id = 1 } = req.body
  try {
    await pool.query('UPDATE user_avatars SET is_equipped = FALSE WHERE user_id = $1', [user_id])
    const { rows } = await pool.query(
      'UPDATE user_avatars SET is_equipped = TRUE WHERE user_id = $1 AND avatar_id = $2 RETURNING *',
      [user_id, avatar_id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Avatar not unlocked' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
