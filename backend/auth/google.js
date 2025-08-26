const GoogleStrategy = require('passport-google-oauth20').Strategy
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      const nombre = profile.displayName

      let user = await prisma.usuario.findUnique({ where: { email } })

      if (!user) {
        user = await prisma.usuario.create({
            data: {
                email,
                nombre,
                rol: 'CLIENTE',
                empresaId: 1,
                proveedor: 'GOOGLE',
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
