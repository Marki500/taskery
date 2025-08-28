/*
  Warnings:

  - A unique constraint covering the columns `[usuarioId,activeKey]` on the table `Timer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Timer` ADD COLUMN `activeKey` VARCHAR(191) NULL,
    ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'timer';

-- CreateIndex
CREATE UNIQUE INDEX `Timer_usuarioId_activeKey_key` ON `Timer`(`usuarioId`, `activeKey`);

-- AddForeignKey
ALTER TABLE `Proyecto` ADD CONSTRAINT `Proyecto_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `Empresa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tarea` ADD CONSTRAINT `Tarea_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `Proyecto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timer` ADD CONSTRAINT `Timer_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timer` ADD CONSTRAINT `Timer_tareaId_fkey` FOREIGN KEY (`tareaId`) REFERENCES `Tarea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
