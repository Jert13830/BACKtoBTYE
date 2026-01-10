const { Prisma } = require('@prisma/client');

module.exports = Prisma.defineExtension({
    name: "softwareValidateExtension",
    query: {
        logiciel: {
            create: async ({ args, query }) => {
                const errors = {}

                // Software title
                if (!/^[A-Za-z0-9][A-Za-z0-9 _+\-:.()]{0,29}$/.test(args.data.nom)) {
                    errors.software = "Invalid or empty software title"
                }

                // Software information text - letters, numbers, spaces, punctuation
                if (!/^[\p{L}\p{N}\s.,:;'"()\-?!]*$/u.test(args.data.details)) {
                    errors.software = "Software information - Invalid text has been entered"
                }

                // Software Link
                if (!/^(?:$|(https?:\/\/)(?!javascript:)(?!data:)[^\s<>"'`]{1,2048})$/i.test(args.data.lien)) {
                    errors.software = "Link - Invalid characters have been entered"
                }

                if (Object.keys(errors).length > 0) {
                    const error = new Error("Validation error")
                    error.details = errors
                    throw error;
                }

                return query(args)


            },
            update: async ({ args, query }) => {
                const errors = {}

                // Software title
                if (!/^[A-Za-z0-9][A-Za-z0-9 _+\-:.()]{0,29}$/.test(args.data.nom)) {
                    errors.software = "Invalid or empty software title"
                }

                // Software information text - letters, numbers, spaces, punctuation
                if (!/^[\p{L}\p{N}\s.,:;'"()\-?!]*$/u.test(args.data.details)) {
                    errors.software = "Software information - Invalid text has been entered"
                }

                // Software Link
                if (!/^(?:$|(https?:\/\/)(?!javascript:)(?!data:)[^\s<>"'`]{1,2048})$/i.test(args.data.lien)) {
                    errors.software = "Link - Invalid characters have been entered"
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