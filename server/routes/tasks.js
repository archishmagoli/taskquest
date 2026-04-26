const express = require('express')
const router = express.Router()
const pool = require('../config/database')

// GET all tasks for a user
router.get('/', async (req, res) => {
  const { user_id, category_id, is_completed, sort } = req.query
  try {
    let query = `
      SELECT tasks.*, categories.name AS category_name, categories.color AS category_color
      FROM tasks
      LEFT JOIN categories ON tasks.category_id = categories.id
      WHERE tasks.user_id = $1
    `
    const params = [user_id || 1]

    if (category_id) {
      params.push(category_id)
      query += ` AND tasks.category_id = $${params.length}`
    }
    if (is_completed !== undefined) {
      params.push(is_completed)
      query += ` AND tasks.is_completed = $${params.length}`
    }

    query += sort === 'due_date' ? ' ORDER BY tasks.due_date ASC' : ' ORDER BY tasks.created_at DESC'

    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create a task
router.post('/', async (req, res) => {
  const { user_id = 1, category_id, title, description, due_date, point_value = 10 } = req.body
  if (!title) return res.status(400).json({ error: 'Title is required' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (user_id, category_id, title, description, due_date, point_value)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, category_id || null, title, description, due_date || null, point_value]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH update a task (including marking complete)
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { title, description, due_date, point_value, is_completed, category_id } = req.body
  try {
    const current = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (!current.rows.length) return res.status(404).json({ error: 'Task not found' })

    const task = current.rows[0]
    const wasCompleted = task.is_completed
    const nowCompleted = is_completed !== undefined ? is_completed : wasCompleted

    const { rows } = await pool.query(
      `UPDATE tasks SET
        title = $1, description = $2, due_date = $3, point_value = $4,
        is_completed = $5, category_id = $6
       WHERE id = $7 RETURNING *`,
      [
        title ?? task.title,
        description ?? task.description,
        due_date ?? task.due_date,
        point_value ?? task.point_value,
        nowCompleted,
        category_id !== undefined ? category_id : task.category_id,
        id,
      ]
    )

    // Award points when task is marked complete for the first time
    if (!wasCompleted && nowCompleted) {
      await pool.query('UPDATE users SET points = points + $1 WHERE id = $2', [task.point_value, task.user_id])
    }
    // Deduct points if uncompleted
    if (wasCompleted && !nowCompleted) {
      await pool.query('UPDATE users SET points = GREATEST(points - $1, 0) WHERE id = $2', [task.point_value, task.user_id])
    }

    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Task not found' })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
