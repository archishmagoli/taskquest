const express = require('express')
const cors = require('cors')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const pool = require('./config/database')
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
  credentials: true,
}))
app.use(express.json())
app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRouter)
app.use('/api/tasks', requireAuth, tasksRouter)
app.use('/api/avatars', requireAuth, avatarsRouter)
app.use('/api/categories', requireAuth, categoriesRouter)
app.use('/api/users', requireAuth, usersRouter)
app.use('/api/reset', requireAuth, resetRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
