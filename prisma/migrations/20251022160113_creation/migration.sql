-- CreateTable
CREATE TABLE `Article` (
    `id_article` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(255) NOT NULL,
    `texte` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `id_categorie` INTEGER NOT NULL,
    `id_ordinateur` INTEGER NOT NULL,
    `id_utilisateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_article`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleLike` (
    `id_article_like` INTEGER NOT NULL AUTO_INCREMENT,
    `score` INTEGER NOT NULL,
    `id_article` INTEGER NOT NULL,
    `id_utilisateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_article_like`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categorie` (
    `id_categorie` INTEGER NOT NULL AUTO_INCREMENT,
    `categorie` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id_categorie`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commentaire` (
    `id_commentaire` INTEGER NOT NULL AUTO_INCREMENT,
    `texte` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `id_article` INTEGER NOT NULL,
    `id_utilisateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_commentaire`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Emulateur` (
    `id_emulateur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,
    `annee` INTEGER NOT NULL,
    `lien` VARCHAR(255) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `langue` VARCHAR(30) NOT NULL,
    `id_fab_emulateur` INTEGER NOT NULL,
    `id_ordinateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_emulateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FabricantEmulateur` (
    `id_fab_emulateur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id_fab_emulateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FabricantLogiciel` (
    `id_fab_logiciel` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id_fab_logiciel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FabricantOrdinateur` (
    `id_fab_ordinateur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id_fab_ordinateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Logiciel` (
    `id_logiciel` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,
    `annee` INTEGER NOT NULL,
    `lien` VARCHAR(255) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `langue` VARCHAR(30) NOT NULL,
    `id_fab_logiciel` INTEGER NOT NULL,

    PRIMARY KEY (`id_logiciel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ordinateur` (
    `id_ordinateur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,
    `annee` INTEGER NOT NULL,
    `cpuType` VARCHAR(255) NOT NULL,
    `cpu` VARCHAR(255) NOT NULL,
    `vitesseHorloge` DECIMAL(5, 2) NOT NULL,
    `ram` INTEGER NOT NULL,
    `rom` INTEGER NOT NULL,
    `graphique` VARCHAR(255) NOT NULL,
    `nbCouleurs` INTEGER NOT NULL,
    `info` VARCHAR(191) NOT NULL,
    `successeur` INTEGER NOT NULL,
    `id_fab_ordinateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_ordinateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Photo` (
    `id_photo` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(255) NOT NULL,
    `alt` VARCHAR(255) NOT NULL,
    `id_fab_ordinateur` INTEGER NOT NULL,
    `id_fab_logiciel` INTEGER NOT NULL,
    `id_logiciel` INTEGER NOT NULL,
    `id_ordinateur` INTEGER NOT NULL,
    `id_fab_emulateur` INTEGER NOT NULL,
    `id_emulateur` INTEGER NOT NULL,
    `id_article` INTEGER NOT NULL,

    UNIQUE INDEX `Photo_id_article_key`(`id_article`),
    PRIMARY KEY (`id_photo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Popularite` (
    `id_popularité` INTEGER NOT NULL AUTO_INCREMENT,
    `score` INTEGER NOT NULL,
    `id_ordinateur` INTEGER NOT NULL,
    `id_utilisateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_popularité`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rarete` (
    `id_rarete` INTEGER NOT NULL AUTO_INCREMENT,
    `score` INTEGER NOT NULL,
    `id_ordinateur` INTEGER NOT NULL,
    `id_utilisateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_rarete`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id_role` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleUtilisateur` (
    `id_role_utilisateurteur` INTEGER NOT NULL AUTO_INCREMENT,
    `id_role` INTEGER NOT NULL,
    `id_utilisateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_role_utilisateurteur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Utilisateur` (
    `id_utilisateur` INTEGER NOT NULL AUTO_INCREMENT,
    `pseudo` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `motDePasse` VARCHAR(255) NOT NULL,
    `id_photo` INTEGER NOT NULL,

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    UNIQUE INDEX `Utilisateur_id_photo_key`(`id_photo`),
    PRIMARY KEY (`id_utilisateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Version` (
    `id_version` INTEGER NOT NULL AUTO_INCREMENT,
    `id_logiciel` INTEGER NOT NULL,
    `id_ordinateur` INTEGER NOT NULL,

    PRIMARY KEY (`id_version`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_id_categorie_fkey` FOREIGN KEY (`id_categorie`) REFERENCES `Categorie`(`id_categorie`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_id_ordinateur_fkey` FOREIGN KEY (`id_ordinateur`) REFERENCES `Ordinateur`(`id_ordinateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleLike` ADD CONSTRAINT `ArticleLike_id_article_fkey` FOREIGN KEY (`id_article`) REFERENCES `Article`(`id_article`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleLike` ADD CONSTRAINT `ArticleLike_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commentaire` ADD CONSTRAINT `Commentaire_id_article_fkey` FOREIGN KEY (`id_article`) REFERENCES `Article`(`id_article`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commentaire` ADD CONSTRAINT `Commentaire_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Emulateur` ADD CONSTRAINT `Emulateur_id_fab_emulateur_fkey` FOREIGN KEY (`id_fab_emulateur`) REFERENCES `FabricantEmulateur`(`id_fab_emulateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Emulateur` ADD CONSTRAINT `Emulateur_id_ordinateur_fkey` FOREIGN KEY (`id_ordinateur`) REFERENCES `Ordinateur`(`id_ordinateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Logiciel` ADD CONSTRAINT `Logiciel_id_fab_logiciel_fkey` FOREIGN KEY (`id_fab_logiciel`) REFERENCES `FabricantLogiciel`(`id_fab_logiciel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ordinateur` ADD CONSTRAINT `Ordinateur_id_fab_ordinateur_fkey` FOREIGN KEY (`id_fab_ordinateur`) REFERENCES `FabricantOrdinateur`(`id_fab_ordinateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_fab_ordinateur_fkey` FOREIGN KEY (`id_fab_ordinateur`) REFERENCES `FabricantOrdinateur`(`id_fab_ordinateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_fab_logiciel_fkey` FOREIGN KEY (`id_fab_logiciel`) REFERENCES `FabricantLogiciel`(`id_fab_logiciel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_logiciel_fkey` FOREIGN KEY (`id_logiciel`) REFERENCES `Logiciel`(`id_logiciel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_ordinateur_fkey` FOREIGN KEY (`id_ordinateur`) REFERENCES `Ordinateur`(`id_ordinateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_fab_emulateur_fkey` FOREIGN KEY (`id_fab_emulateur`) REFERENCES `FabricantEmulateur`(`id_fab_emulateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_emulateur_fkey` FOREIGN KEY (`id_emulateur`) REFERENCES `Emulateur`(`id_emulateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_id_article_fkey` FOREIGN KEY (`id_article`) REFERENCES `Article`(`id_article`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Popularite` ADD CONSTRAINT `Popularite_id_ordinateur_fkey` FOREIGN KEY (`id_ordinateur`) REFERENCES `Ordinateur`(`id_ordinateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Popularite` ADD CONSTRAINT `Popularite_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rarete` ADD CONSTRAINT `Rarete_id_ordinateur_fkey` FOREIGN KEY (`id_ordinateur`) REFERENCES `Ordinateur`(`id_ordinateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rarete` ADD CONSTRAINT `Rarete_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleUtilisateur` ADD CONSTRAINT `RoleUtilisateur_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `Role`(`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleUtilisateur` ADD CONSTRAINT `RoleUtilisateur_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Utilisateur` ADD CONSTRAINT `Utilisateur_id_photo_fkey` FOREIGN KEY (`id_photo`) REFERENCES `Photo`(`id_photo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Version` ADD CONSTRAINT `Version_id_logiciel_fkey` FOREIGN KEY (`id_logiciel`) REFERENCES `Logiciel`(`id_logiciel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Version` ADD CONSTRAINT `Version_id_ordinateur_fkey` FOREIGN KEY (`id_ordinateur`) REFERENCES `Ordinateur`(`id_ordinateur`) ON DELETE RESTRICT ON UPDATE CASCADE;
