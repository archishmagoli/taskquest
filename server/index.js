const express = require('express')
const cors = require('cors')
require('dotenv').config()

const tasksRouter = require('./routes/tasks')
const avatarsRouter = require('./routes/avatars')
const categoriesRouter = require('./routes/categories')
const usersRouter = require('./routes/users')
const resetRouter = require('./routes/reset')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/tasks', tasksRouter)
app.use('/api/avatars', avatarsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/users', usersRouter)
app.use('/api/reset', resetRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
