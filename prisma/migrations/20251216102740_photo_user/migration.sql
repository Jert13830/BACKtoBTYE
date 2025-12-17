/*
  Warnings:

  - You are about to drop the column `id_photo` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Utilisateur_id_photo_key` ON `Utilisateur`;

-- AlterTable
ALTER TABLE `Utilisateur` DROP COLUMN `id_photo`;
