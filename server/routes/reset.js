const express = require('express')
const router = express.Router()
const pool = require('../config/database')

router.post('/', async (req, res) => {
  try {
    await pool.query(`
      TRUNCATE user_avatars, tasks, categories, avatars, users RESTART IDENTITY CASCADE;

      INSERT INTO users (username, points) VALUES ('player1', 0);

      INSERT INTO categories (user_id, name, color) VALUES
        (1, 'School', '#6366f1'),
        (1, 'Work', '#f59e0b'),
        (1, 'Personal', '#10b981'),
        (1, 'Health', '#ef4444');

      INSERT INTO tasks (user_id, category_id, title, description, due_date, point_value) VALUES
        (1, 1, 'Complete WEB103 milestone', 'Finish the final project milestone', NOW() + INTERVAL '3 days', 20),
        (1, 3, 'Go for a walk', 'Take a 30 minute walk outside', NOW() + INTERVAL '1 day', 10);

      INSERT INTO avatars (name, image_url, point_cost, description) VALUES
        ('Whiskers', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Whiskers', 0, 'Your default companion — always ready to help!'),
        ('Buddy', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Buddy', 50, 'A loyal friend earned through hard work.'),
        ('Hoppy', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Hoppy', 100, 'Quick and energetic — just like you!'),
        ('Foxy', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Foxy', 150, 'Clever and cunning. A rare unlock.'),
        ('Cosmo', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cosmo', 250, 'Out of this world. For the truly dedicated.');

      INSERT INTO user_avatars (user_id, avatar_id, is_equipped) VALUES (1, 1, TRUE);
    `)
    res.json({ message: 'Database reset successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
