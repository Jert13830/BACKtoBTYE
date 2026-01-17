const {Prisma} = require('@prisma/client')
const bcrypt = require('bcrypt')

module.exports = Prisma.defineExtension({
    name: "hashPasswordExtension",
    query: {
         utilisateur: {
            create: async ({ args, query }) => {
                if (!args.data.motDePasse) {
                    throw new Error("Password is required");
                }
                const hashedPassword = bcrypt.hashSync(args.data.motDePasse, 12);
                args.data.motDePasse = hashedPassword;
                return query(args);
            }
        }
    }
})