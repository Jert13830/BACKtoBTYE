/*
  Warnings:

  - The primary key for the `RoleUtilisateur` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_role_utilisateurteur` on the `RoleUtilisateur` table. All the data in the column will be lost.
  - Added the required column `id_role_utilisateur` to the `RoleUtilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RoleUtilisateur` DROP PRIMARY KEY,
    DROP COLUMN `id_role_utilisateurteur`,
    ADD COLUMN `id_role_utilisateur` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id_role_utilisateur`);
