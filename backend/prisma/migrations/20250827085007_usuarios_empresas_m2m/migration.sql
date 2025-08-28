/*
  Warnings:

  - You are about to drop the column `empresaId` on the `Usuario` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Usuario` DROP FOREIGN KEY `Usuario_empresaId_fkey`;

-- DropIndex
DROP INDEX `Usuario_empresaId_fkey` ON `Usuario`;

-- AlterTable
ALTER TABLE `Usuario` DROP COLUMN `empresaId`;

-- CreateTable
CREATE TABLE `_EmpresasUsuarios` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EmpresasUsuarios_AB_unique`(`A`, `B`),
    INDEX `_EmpresasUsuarios_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_EmpresasUsuarios` ADD CONSTRAINT `_EmpresasUsuarios_A_fkey` FOREIGN KEY (`A`) REFERENCES `Empresa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EmpresasUsuarios` ADD CONSTRAINT `_EmpresasUsuarios_B_fkey` FOREIGN KEY (`B`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
