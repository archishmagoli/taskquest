const express = require('express')
const router = express.Router()
const pool = require('../config/database')

// GET all categories for a user
router.get('/', async (req, res) => {
  const { user_id = 1 } = req.query
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC',
      [user_id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create a category
router.post('/', async (req, res) => {
  const { user_id = 1, name, color = '#6366f1' } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (user_id, name, color) VALUES ($1, $2, $3) RETURNING *',
      [user_id, name, color]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE a category
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Category not found' })
    res.json({ message: 'Category deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
