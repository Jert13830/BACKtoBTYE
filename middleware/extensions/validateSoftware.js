const { Prisma } = require('@prisma/client');

module.exports = Prisma.defineExtension({
    name: "softwareValidateExtension",
    query: {
        ordinateur: {
            create: async ({ args, query }) => {
                const errors = { }
                //Software title
                if (!/^[A-Za-z0-9][A-Za-z0-9 ./_+-]*$/.test(args.data.nom)) {
                    errors.computerName = "Invalid or empty computer name"
                }
                // Software Information text consisting entirely of letters, numbers, and whitespace.  Can be empty.
                if (!/^[\p{L}\p{N}\s]*$/u.test(args.data.info)) {
                    errors.computerInfo = "Invalid text has been entered"
                }
                //Software Link
                if (!/^[A-Za-z0-9][A-Za-z0-9\s\-.+]*[A-Za-z0-9.+]$|^[A-Za-z0-9]+$/i.test(args.data.cpu)) {
                errors.cpu = "CPU - Invalid characters have been entered"
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
                //First character must be a letter or number (no leading +, space, -, etc.) With at least 1 character (not null)
                if (!/^[A-Za-z0-9][A-Za-z0-9 ./_+-]*$/.test(args.data.nom)) {
                    errors.computerName = "Invalid or empty computer name"
                }
                // Computer Information text consisting entirely of letters, numbers, and whitespace.  Can be empty.
                if (!/^[\p{L}\p{N}\s]*$/u.test(args.data.info)) {
                    errors.computerInfo = "Invalid text has been entered"
                }

                if (!/^[A-Za-z0-9][A-Za-z0-9\s\-.+]*[A-Za-z0-9.+]$|^[A-Za-z0-9]+$/i.test(args.data.cpu)) {
                errors.cpu = "CPU - Invalid characters have been entered"
                }

                if (!/^[A-Za-z0-9][A-Za-z0-9\s\-.+*/]*[A-Za-z0-9]$|^[A-Za-z0-9]+$/i.test(args.data.graphique)) {
                errors.graphics = "Graphics - Invalid characters have been entered"
                }

                if (!/^[A-Za-z0-9][A-Za-z0-9\s\-.+*/]*[A-Za-z0-9]$|^[A-Za-z0-9]+$/i.test(args.data.son)) {
                errors.sound = "Sound - Invalid characters have been entered"
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