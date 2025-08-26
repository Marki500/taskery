const GitHubStrategy = require('passport-github2').Strategy
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = (passport) => {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback',
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      const nombre = profile.displayName || profile.username

      let user = await prisma.usuario.findUnique({ where: { email } })

      if (!user) {
            user = await prisma.usuario.create({
            data: {
                email,
                nombre,
                rol: 'CLIENTE',
                empresaId: 1,
                proveedor: 'GITHUB',
                oauthId: profile.id
            }
            })
      }

      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }))
}
