const GitHubStrategy = require('passport-github2').Strategy
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = (passport) => {
  passport.use(new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub puede no devolver email público. Intentamos coger el principal.
        const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || null
        const nombre = profile.displayName || profile.username || 'Usuario GitHub'

        // Buscar por email si existe; si no, por (proveedor + oauthId)
        let user = null
        if (email) {
          user = await prisma.usuario.findUnique({ where: { email } })
        }
        if (!user) {
          user = await prisma.usuario.findFirst({
            where: { proveedor: 'GITHUB', oauthId: profile.id }
          })
        }

        if (!user) {
          // Si GitHub no trae email, no podemos cumplir la unique constraint si tu schema exige email.
          // Puedes optar por rechazar o generar un placeholder único:
          let finalEmail = email
          if (!finalEmail) {
            // Placeholder único y válido (ajústalo a tu gusto/política)
            finalEmail = `gh_${profile.id}@users.noreply.github.local`
          }

          // (Opcional) Conectar a empresa por defecto id=1 si existe
          let connectEmpresas
          const empresaDefault = await prisma.empresa.findUnique({ where: { id: 1 } })
          if (empresaDefault) {
            connectEmpresas = { connect: [{ id: empresaDefault.id }] }
          }

          user = await prisma.usuario.create({
            data: {
              email: finalEmail,
              nombre,
              rol: 'CLIENTE',
              proveedor: 'GITHUB',
              oauthId: profile.id,
              ...(connectEmpresas ? { empresas: connectEmpresas } : {})
            }
          })
        } else {
          // Refrescar datos básicos si procede
          await prisma.usuario.update({
            where: { id: user.id },
            data: {
              nombre: user.nombre || nombre,
              proveedor: 'GITHUB',
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
