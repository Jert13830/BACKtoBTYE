const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

/**
 * Authentication middleware to protect routes.
 * Checks whether the user is logged in (present in the session) and exists in the database.
 */
console.log("This is authGuard");

const authguard = async (req, res, next) => {
    try {
        // Check whether the session contains a user
        console.log(req.session.user);

        if (req.session.user) {
            // Searches for the user in the database using their ID stored in the session.
            console.log("Search if User exists " , req.session.user.id);
            const user = await prisma.utilisateur.findUnique({
                where: {
                    id_utilisateur: req.session.user.id
                }
            })
            // If the user exists in the database, the request is allowed to proceed.
            if (user) {
                 console.log("Then here");
                return next()
            }
        }
        // If no user is logged in or not found in the database, an error is raised.
        console.log("User does not exist !!!");
        throw new Error("User not connected")
    } catch (error) {
        // In case of an error, you will be redirected to the login page.
        res.redirect('/connect')
    }
}

// We export the middleware for use in routes.
module.exports = authguard