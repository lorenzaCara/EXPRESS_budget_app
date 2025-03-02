/*
  Warnings:

  - Made the column `description` on table `money` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `money` MODIFY `description` VARCHAR(191) NOT NULL;
