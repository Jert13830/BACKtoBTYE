/*
  Warnings:

  - A unique constraint covering the columns `[id_utilisateur]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Utilisateur` DROP FOREIGN KEY `Utilisateur_id_photo_fkey`;

-- CreateIndex
CREATE UNIQUE INDEX `Photo_id_utilisateur_key` ON `Photo`(`id_utilisateur`);

-- CreateIndex
CREATE INDEX `Photo_id_utilisateur_fkey` ON `Photo`(`id_utilisateur`);

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE;
