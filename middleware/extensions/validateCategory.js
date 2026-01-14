const { Prisma } = require('@prisma/client');

module.exports = Prisma.defineExtension({
    name: "categoryValidateExtension",
    query: {
        categorie: {
            create: async ({ args, query }) => {
                const errors = { }
                //Starts with a letter or number. Ends with a letter or number. Length: 3–30 characters total
                if (!/^[A-Za-z0-9][A-Za-z0-9 _-]{1,28}[A-Za-z0-9]$/.test(args.data.categorie)) {
                    errors.manufacturerName = "Invalid or empty category name"
                }
                
                if (Object.keys(errors).length > 0) {
                    const error = new Error("Validation error")
                    error.details = errors
                    throw error;  
                }
                return query(args)
                
            },
            update: async ({ args, query }) => {
                const errors = { }
                
                //Starts with a letter or number. Ends with a letter or number. Length: 3–30 characters total
                if (!/^[A-Za-z0-9][A-Za-z0-9 _-]{1,28}[A-Za-z0-9]$/.test(args.data.categorie)) {
                    errors.manufacturerName = "Invalid or empty category name"
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