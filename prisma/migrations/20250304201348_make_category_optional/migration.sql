-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_categoryId_fkey`;

-- DropIndex
DROP INDEX `Transaction_categoryId_fkey` ON `transaction`;

-- AlterTable
ALTER TABLE `transaction` MODIFY `categoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
