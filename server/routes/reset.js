const express = require('express')
const router = express.Router()
const pool = require('../config/database')

router.post('/', async (req, res) => {
  const user_id = req.user.id
  try {
    // Wipe user's tasks, categories, and avatar unlocks
    await pool.query('DELETE FROM tasks WHERE user_id = $1', [user_id])
    await pool.query('DELETE FROM categories WHERE user_id = $1', [user_id])
    await pool.query('DELETE FROM user_avatars WHERE user_id = $1', [user_id])

    // Reset points to 0
    await pool.query('UPDATE users SET points = 0 WHERE id = $1', [user_id])

    // Re-seed default categories
    await pool.query(`
      INSERT INTO categories (user_id, name, color) VALUES
        ($1, 'School', '#6366f1'),
        ($1, 'Work', '#f59e0b'),
        ($1, 'Personal', '#10b981'),
        ($1, 'Health', '#ef4444')
    `, [user_id])

    // Re-seed default tasks
    const { rows: cats } = await pool.query(
      'SELECT id, name FROM categories WHERE user_id = $1',
      [user_id]
    )
    const school = cats.find(c => c.name === 'School')?.id
    const personal = cats.find(c => c.name === 'Personal')?.id

    await pool.query(`
      INSERT INTO tasks (user_id, category_id, title, description, due_date, point_value) VALUES
        ($1, $2, 'Complete WEB103 milestone', 'Finish the final project milestone', NOW() + INTERVAL '3 days', 20),
        ($1, $3, 'Go for a walk', 'Take a 30 minute walk outside', NOW() + INTERVAL '1 day', 10)
    `, [user_id, school || null, personal || null])

    // Re-equip free avatar
    const { rows: freeAvatars } = await pool.query('SELECT id FROM avatars WHERE point_cost = 0 LIMIT 1')
    if (freeAvatars.length) {
      await pool.query(
        'INSERT INTO user_avatars (user_id, avatar_id, is_equipped) VALUES ($1, $2, TRUE)',
        [user_id, freeAvatars[0].id]
      )
    }

    res.json({ message: 'Profile reset successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
