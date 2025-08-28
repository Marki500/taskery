const GoogleStrategy = require('passport-google-oauth20').Strategy
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = (passport) => {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] && profile.emails[0].value
        const nombre = profile.displayName || (profile.name ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() : 'Usuario Google')

        // Buscar primero por email (si existe), si no por proveedor+oauthId
        let user = null
        if (email) {
          user = await prisma.usuario.findUnique({ where: { email } })
        }
        if (!user) {
          user = await prisma.usuario.findFirst({
            where: { proveedor: 'GOOGLE', oauthId: profile.id }
          })
        }

        if (!user) {
          // (Opcional) Conectar a empresa por defecto id=1 si existe
          let connectEmpresas
          const empresaDefault = await prisma.empresa.findUnique({ where: { id: 1 } })
          if (empresaDefault) {
            connectEmpresas = { connect: [{ id: empresaDefault.id }] }
          }

          user = await prisma.usuario.create({
            data: {
              email, // Prisma requiere email único según tu schema
              nombre,
              rol: 'CLIENTE',
              proveedor: 'GOOGLE',
              oauthId: profile.id,
              ...(connectEmpresas ? { empresas: connectEmpresas } : {})
            }
          })
        } else {
          // Actualiza avatar/nombre si quieres mantenerlos frescos
          await prisma.usuario.update({
            where: { id: user.id },
            data: {
              nombre: user.nombre || nombre,
              proveedor: 'GOOGLE',
              oauthId: profile.id
            }
          })
        }

        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  ))
}
