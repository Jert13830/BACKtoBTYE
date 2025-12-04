-- DropForeignKey
ALTER TABLE `Photo` DROP FOREIGN KEY `Photo_id_article_fkey`;

-- DropForeignKey
ALTER TABLE `Photo` DROP FOREIGN KEY `Photo_id_emulateur_fkey`;

-- DropForeignKey
ALTER TABLE `Photo` DROP FOREIGN KEY `Photo_id_fab_emulateur_fkey`;

-- DropForeignKey
ALTER TABLE `Photo` DROP FOREIGN KEY `Photo_id_fab_logiciel_fkey`;

-- DropForeignKey
ALTER TABLE `Photo` DROP FOREIGN KEY `Photo_id_fab_ordinateur_fkey`;

-- DropForeignKey
ALTER TABLE `Photo` DROP FOREIGN KEY `Photo_id_logiciel_fkey`;

-- DropForeignKey
ALTER TABLE `Photo` DROP FOREIGN KEY `Photo_id_ordinateur_fkey`;

-- AlterTable
ALTER TABLE `Photo` MODIFY `alt` VARCHAR(255) NULL,
    MODIFY `id_fab_ordinateur` INTEGER NULL,
    MODIFY `id_fab_logiciel` INTEGER NULL,
    MODIFY `id_logiciel` INTEGER NULL,
    MODIFY `id_ordinateur` INTEGER NULL,
    MODIFY `id_fab_emulateur` INTEGER NULL,
    MODIFY `id_emulateur` INTEGER NULL,
    MODIFY `id_article` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_article_fkey` FOREIGN KEY (`id_article`) REFERENCES `Article`(`id_article`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_emulateur_fkey` FOREIGN KEY (`id_emulateur`) REFERENCES `Emulateur`(`id_emulateur`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_fab_emulateur_fkey` FOREIGN KEY (`id_fab_emulateur`) REFERENCES `FabricantEmulateur`(`id_fab_emulateur`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_fab_logiciel_fkey` FOREIGN KEY (`id_fab_logiciel`) REFERENCES `FabricantLogiciel`(`id_fab_logiciel`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_fab_ordinateur_fkey` FOREIGN KEY (`id_fab_ordinateur`) REFERENCES `FabricantOrdinateur`(`id_fab_ordinateur`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_logiciel_fkey` FOREIGN KEY (`id_logiciel`) REFERENCES `Logiciel`(`id_logiciel`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_ordinateur_fkey` FOREIGN KEY (`id_ordinateur`) REFERENCES `Ordinateur`(`id_ordinateur`) ON DELETE SET NULL ON UPDATE CASCADE;
