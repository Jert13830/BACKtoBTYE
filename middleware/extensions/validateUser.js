const { Prisma } = require('@prisma/client');
console.log("Checking user");
module.exports = Prisma.defineExtension({
    name: "userValidateExtension",
    query: {
        utilisateur: {
            create: async ({ args, query }) => {
                const errors = { }
                  console.log("checking things out");
                console.log(args.data);

                //First character must be a letter or number (no leading +, space, -, etc.) With at least 1 character (not null)
                if (!/^[A-Za-z0-9][A-Za-z0-9 ./_+-]*$/.test(args.data.pseudo)) {
                    errors.usernameProfile = "Invalid or empty user name"
                }
                
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.data.email)) {
                        errors.email = "Invalid or empty email address"
                    }

                if(!/^(?=.*?[0-9])(?=.*?[A-Za-z]).{6,}$/.test(args.data.motDePasse)){
                        errors.password = "6 characters minimum, with at least one letter (A-Za-z)";
                    }

                    if(!/^(?=.*?[0-9])(?=.*?[A-Za-z]).{6,}$/.test(args.data.currentPassword)){
                        errors.password = "6 characters minimum, with at least one letter (A-Za-z)";
                    }

                    if(!/^(?=.*?[0-9])(?=.*?[A-Za-z]).{6,}$/.test(args.data.newPassword)){
                        errors.password = "6 characters minimum, with at least one letter (A-Za-z)";
                    }

                    if(!/^(?=.*?[0-9])(?=.*?[A-Za-z]).{6,}$/.test(args.data.confirmPassword)){
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