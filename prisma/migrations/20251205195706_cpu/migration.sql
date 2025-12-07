/*
  Warnings:

  - You are about to alter the column `cpuType` on the `Ordinateur` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Ordinateur` MODIFY `cpuType` INTEGER NOT NULL;
