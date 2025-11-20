// On importe PrismaClient depuis le client généré par Prisma
const { PrismaClient } = require("../../generated/prisma/client")
// On instancie PrismaClient pour interagir avec la base de données
const prisma = new PrismaClient()

/**
 * Middleware d'authentification pour protéger les routes.
 * Vérifie si l'utilisateur est connecté (présent dans la session)
 * et existe bien en base de données.
 */
const authguard = async (req, res, next) => {
    try {
        // Vérifie si la session contient un utilisateur
        if (req.session.user) {
            // Recherche l'utilisateur en base via son id stocké en session
            const user = await prisma.user.findUnique({
                where: {
                    id: req.session.user.id
                }
            })
            // Si l'utilisateur existe en base, on laisse passer la requête
            if (user) {
                return next()
            }
        }
        // Si pas d'utilisateur en session ou pas trouvé en base, on lève une erreur
        throw new Error("Utilisateur non connecté")
    } catch (error) {
        // En cas d'erreur, on redirige vers la page de connexion
        res.redirect('/login')
    }
}

// On exporte le middleware pour l'utiliser dans les routes
module.exports = authguard