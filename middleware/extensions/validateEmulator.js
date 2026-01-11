const { Prisma } = require('@prisma/client');

module.exports = Prisma.defineExtension({
    name: "emulatorValidateExtension",
    query: {
        emulateur: {
            create: async ({ args, query }) => {
                const errors = {}

                // Emulator title
                if (!/^[A-Za-z0-9][A-Za-z0-9 _+\-:.()]{0,29}$/.test(args.data.nom)) {
                    errors.emulator = "Invalid or empty emulator title"
                }

                // Emulator information text - letters, numbers, spaces, punctuation
                if (!/^[\p{L}\p{N}\s.,:;'"()\-?!]*$/u.test(args.data.details)) {
                    errors.emulator = "Emulator information - Invalid text has been entered"
                }

                // Emulator Link
                if (!/^(?:$|(https?:\/\/)(?!javascript:)(?!data:)[^\s<>"'`]{1,2048})$/i.test(args.data.lien)) {
                    errors.emulator = "Link - Invalid characters have been entered"
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

                // Emulator title
                if (!/^[A-Za-z0-9][A-Za-z0-9 _+\-:.()]{0,29}$/.test(args.data.nom)) {
                    errors.emulator = "Invalid or empty emulator title"
                }

                // Emulator information text - letters, numbers, spaces, punctuation
                if (!/^[\p{L}\p{N}\s.,:;'"()\-?!]*$/u.test(args.data.details)) {
                    errors.emulator = "Emulator information - Invalid text has been entered"
                }

                // Emulator Link
                if (!/^(?:$|(https?:\/\/)(?!javascript:)(?!data:)[^\s<>"'`]{1,2048})$/i.test(args.data.lien)) {
                    errors.emulator = "Link - Invalid characters have been entered"
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