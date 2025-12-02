//const { Prisma } = require('@prisma/client')
const { PrismaClient, Prisma } = require("../generated/prisma").PrismaClient;

module.exports = Prisma.defineExtension({
    name: "computerValidateExtension",
    query: {
        user: {
            create: async ({ args, query }) => {
                const errors = { }
                //First character must be a letter or number (no leading +, space, -, etc.) With at least 1 character (not null)
                if (!/^[A-Za-z0-9][A-Za-z0-9 ./_+-]*$/.test(args.data.userName)) {
                    errors.userName = "Invalide or empty user name"
                }

                
                if (Object.keys(errors).length > 0) {
                    const error = new Error("Validation error")
                    error.details = errors
                    throw error;  
                }
                return query(args)
                

            }
        }
    }
})