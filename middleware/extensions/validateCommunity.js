const { Prisma } = require('@prisma/client');

module.exports = Prisma.defineExtension({
    name: "categoryValidateExtension",
    query: {
        article: {
            create: async ({ args, query }) => {
                const errors = { }
                //Starts with a letter or number. Ends with a letter or number. Length: 3–30 characters total
               if (!/^[\p{L}\p{N}\p{P}\p{Zs}'"«»-–—…!?.,:;()&%#@$€£¥*]{3,60}$/u.test(args.data.titre)) {
                    errors.post = "Invalid or empty post title"
                }
                
                // Post text consisting entirely of letters, numbers, and whitespace.  Can be empty.
                if (!/^[^<>]{1,5000}$/u.test(args.data.texte)) {
                    errors.post = "Invalid text has been entered"
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
                if (!!/^[\p{L}\p{N}\p{P}\p{Zs}'"«»-–—…!?.,:;()&%#@$€£¥*]{3,60}$/u.test(args.data.titre)) {
                    errors.post = "Invalid or empty post title"
                }
                
                // Post text consisting entirely of letters, numbers, and whitespace.  Can be empty.
                if (!/^[^<>]{1,5000}$/u.test(args.data.texte)) {
                    errors.post = "Invalid text has been entered"
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