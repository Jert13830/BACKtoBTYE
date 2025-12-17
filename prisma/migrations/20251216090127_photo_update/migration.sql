-- DropForeignKey
ALTER TABLE `Utilisateur` DROP FOREIGN KEY `Utilisateur_id_photo_fkey`;

-- AlterTable
ALTER TABLE `Photo` ADD COLUMN `id_utilisateur` INTEGER NULL;

-- AlterTable
ALTER TABLE `Utilisateur` MODIFY `id_photo` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Utilisateur` ADD CONSTRAINT `Utilisateur_id_photo_fkey` FOREIGN KEY (`id_photo`) REFERENCES `Photo`(`id_photo`) ON DELETE SET NULL ON UPDATE CASCADE;
