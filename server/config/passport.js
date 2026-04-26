const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const pool = require('./database')

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE github_id = $1', [String(profile.id)])
      if (rows.length) return done(null, rows[0])

      const { rows: newRows } = await pool.query(
        'INSERT INTO users (username, github_id, points) VALUES ($1, $2, 0) RETURNING *',
        [profile.username || profile.displayName || 'user', String(profile.id)]
      )
      const newUser = newRows[0]

      // Give new user the free default avatar if one exists
      const { rows: freeAvatars } = await pool.query('SELECT id FROM avatars WHERE point_cost = 0 LIMIT 1')
      if (freeAvatars.length) {
        await pool.query(
          'INSERT INTO user_avatars (user_id, avatar_id, is_equipped) VALUES ($1, $2, TRUE)',
          [newUser.id, freeAvatars[0].id]
        )
      }

      done(null, newUser)
    } catch (err) {
      done(err)
    }
  }
))

passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    done(null, rows[0] || false)
  } catch (err) {
    done(err)
  }
})

module.exports = passport
