const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

/**
 * Authentication middleware to protect routes.
 * Checks whether the user is logged in (present in the session) and exists in the database.
 */


const authguard = async (req, res, next) => {
    try {
        // Check whether the session contains a user

        if (req.session.user) {
            // Searches for the user in the database using their ID stored in the session.
           
            const user = await prisma.utilisateur.findUnique({
                where: {
                    id_utilisateur: req.session.user.id
                }
            })
            // If the user exists in the database, the request is allowed to proceed.
            if (user) {
                return next()
            }
        }
        // If no user is logged in or not found in the database, an error is raised.
       
        throw new Error("User not connected")
    } catch (error) {
        // In case of an error, you will be redirected to the login page.
        res.redirect('/connect')
    }
}

// We export the middleware for use in routes.
module.exports = authguard