const { Prisma } = require('@prisma/client')

module.exports = Prisma.defineExtension({
    name: "computerValidateExtension",
    query: {
        computer: {
            create: async ({ args, query }) => {
                const errors = { }
                //First character must be a letter or number (no leading +, space, -, etc.) With at least 1 character (not null)
                if (!/^[A-Za-z0-9][A-Za-z0-9 ./_+-]*$/.test(args.data.computerName)) {
                    errors.computerName = "Invalide or empty computer name"
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