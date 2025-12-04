const { Prisma } = require('@prisma/client');

module.exports = Prisma.defineExtension({
   
    name: "computerManufacturerValidateExtension",
    query: {
          
        fabricantOrdinateur: {
            
            create: async ({ args, query }) => {
                const errors = { }
                
                //No dangerous characters, must start/end alphanumeric, minimum 1 char, max 50 char
                if (!/^(?!.*[<>'"\\;%`])[A-Za-z0-9](?:[A-Za-z0-9 .&()-]{0,48})?[A-Za-z0-9]$/.test(args.data.nom)) {
                 errors.computerManufacturerName = "Invalide manufacturer name"
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