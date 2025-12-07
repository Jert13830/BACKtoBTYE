/*
  Warnings:

  - Added the required column `son` to the `Ordinateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Ordinateur` ADD COLUMN `son` VARCHAR(255) NOT NULL;
