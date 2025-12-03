/*
  Warnings:

  - The primary key for the `Popularite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_popularité` on the `Popularite` table. All the data in the column will be lost.
  - Added the required column `id_popularite` to the `Popularite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Popularite` DROP PRIMARY KEY,
    DROP COLUMN `id_popularité`,
    ADD COLUMN `id_popularite` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id_popularite`);
