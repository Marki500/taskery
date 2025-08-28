-- AlterTable
ALTER TABLE `Tarea` ADD COLUMN `posicion` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Tarea_proyectoId_estado_posicion_idx` ON `Tarea`(`proyectoId`, `estado`, `posicion`);

-- CreateIndex
CREATE INDEX `Timer_inicio_idx` ON `Timer`(`inicio`);

-- RedefineIndex
CREATE INDEX `Proyecto_empresaId_idx` ON `Proyecto`(`empresaId`);
-- DROP INDEX `Proyecto_empresaId_fkey` ON `Proyecto`;
ALTER TABLE `Proyecto` DROP FOREIGN KEY `Proyecto_empresaId_fkey`;

-- RedefineIndex
CREATE INDEX `Tarea_proyectoId_idx` ON `Tarea`(`proyectoId`);
-- DROP INDEX `Tarea_proyectoId_fkey` ON `Tarea`;
ALTER TABLE `Tarea` DROP FOREIGN KEY `Tarea_proyectoId_fkey`;

-- RedefineIndex
CREATE INDEX `Timer_tareaId_idx` ON `Timer`(`tareaId`);
-- DROP INDEX `Timer_tareaId_fkey` ON `Timer`;
ALTER TABLE `Timer` DROP FOREIGN KEY `Timer_tareaId_fkey`;

-- RedefineIndex
CREATE INDEX `Timer_usuarioId_idx` ON `Timer`(`usuarioId`);
-- DROP INDEX `Timer_usuarioId_fkey` ON `Timer`;
ALTER TABLE `Timer` DROP FOREIGN KEY `Timer_usuarioId_fkey`;

