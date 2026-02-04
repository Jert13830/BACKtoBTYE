const { Prisma } = require('@prisma/client');
const bcrypt = require('bcrypt');

module.exports = Prisma.defineExtension({
  name: "hashPasswordExtension",
  query: {
    utilisateur: {
      create: async ({ args, query }) => {
        if (!args.data.motDePasse) {
          throw new Error("Password is required");
        }
        args.data.motDePasse = await bcrypt.hash(args.data.motDePasse, 12);
        return query(args);
      },
      update: async ({ args, query }) => {
        if (args.data.motDePasse) {
          args.data.motDePasse = await bcrypt.hash(args.data.motDePasse, 12);
        }
        return query(args);
      }
    }
  }
});
