const express = require('express')
const cors = require('cors')
require('dotenv').config()

const passport = require('./config/passport')
const tasksRouter = require('./routes/tasks')
const avatarsRouter = require('./routes/avatars')
const categoriesRouter = require('./routes/categories')
const usersRouter = require('./routes/users')
const resetRouter = require('./routes/reset')
const authRouter = require('./routes/auth')
const requireAuth = require('./middleware/requireAuth')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(passport.initialize())

app.use('/auth', authRouter)
app.use('/api/tasks', requireAuth, tasksRouter)
app.use('/api/avatars', requireAuth, avatarsRouter)
app.use('/api/categories', requireAuth, categoriesRouter)
app.use('/api/users', requireAuth, usersRouter)
app.use('/api/reset', requireAuth, resetRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
