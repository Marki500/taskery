/*
  Warnings:

  - You are about to drop the column `titulo` on the `Tarea` table. All the data in the column will be lost.
  - Added the required column `nombre` to the `Tarea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Empresa` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT '#FFFFFF';

-- AlterTable
ALTER TABLE `Tarea` DROP COLUMN `titulo`,
    ADD COLUMN `estado` ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
    ADD COLUMN `nombre` VARCHAR(191) NOT NULL DEFAULT 'Sin nombre',
    ADD COLUMN `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA') NOT NULL DEFAULT 'MEDIA';
