const { Prisma } = require('@prisma/client');
console.log("Checking user");
module.exports = Prisma.defineExtension({
    name: "userValidateExtension",
    query: {
        utilisateur: {
            create: async ({ args, query }) => {
                const errors = { }
                //First character must be a letter or number (no leading +, space, -, etc.) With at least 1 character (not null)
                if (!/^[A-Za-z0-9][A-Za-z0-9 ./_+-]*$/.test(args.data.pseudo)) {
                    errors.usernameProfile = "Invalid or empty user name"
                }

                console.log("hello from here");
                
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.data.email)) {
                        errors.email = "Invalid or empty email address"
                    }

                if(!/^(?=.*?[0-9])(?=.*?[A-Za-z]).{6,}$/.test(args.data.motDePasse)){
                        errors.password = "6 characters minimum, with at least one letter (A-Za-z)";
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