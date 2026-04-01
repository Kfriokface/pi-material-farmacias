/*
  Warnings:

  - You are about to drop the column `limiteUsuarioAnual` on the `configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `permiteEvento` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `avisoLimiteUsuario` on the `solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `tokenFabricante` on the `solicitud` table. All the data in the column will be lost.
  - The values [ENVIADA] on the enum `Solicitud_estado` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `tipoEstablecimiento` on table `material` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Solicitud_tokenFabricante_key` ON `solicitud`;

-- AlterTable
ALTER TABLE `configuracion` DROP COLUMN `limiteUsuarioAnual`,
    ADD COLUMN `entregaDefaultCodigoPostal` VARCHAR(191) NULL,
    ADD COLUMN `entregaDefaultDireccion` VARCHAR(191) NULL,
    ADD COLUMN `entregaDefaultLocalidad` VARCHAR(191) NULL,
    ADD COLUMN `entregaDefaultProvincia` VARCHAR(191) NULL,
    ADD COLUMN `limiteAnualPorFarmacia` DOUBLE NULL;

-- AlterTable
ALTER TABLE `establecimiento` MODIFY `tipo` ENUM('FARMACIA', 'CLINICA', 'EVENTO') NOT NULL DEFAULT 'FARMACIA',
    MODIFY `lengua` ENUM('ES', 'CA', 'EU', 'GL', 'VA') NOT NULL DEFAULT 'ES';

-- AlterTable
ALTER TABLE `material` DROP COLUMN `permiteEvento`,
    ADD COLUMN `altoMaxCm` INTEGER NULL,
    ADD COLUMN `anchoMaxCm` INTEGER NULL,
    ADD COLUMN `imagenZoom` VARCHAR(191) NULL,
    ADD COLUMN `lenguas` VARCHAR(191) NULL,
    MODIFY `tipoEstablecimiento` ENUM('FARMACIA', 'CLINICA', 'EVENTO') NOT NULL;

-- AlterTable
ALTER TABLE `proveedor` ADD COLUMN `provincia` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `solicitud` DROP COLUMN `avisoLimiteUsuario`,
    DROP COLUMN `tokenFabricante`,
    ADD COLUMN `agendaDireccionId` INTEGER NULL,
    ADD COLUMN `anio` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `areaId` INTEGER NULL,
    ADD COLUMN `avisoLimiteArea` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `imputadoId` INTEGER NULL,
    ADD COLUMN `lenguaPersonalizacion` VARCHAR(191) NULL,
    ADD COLUMN `origenDireccion` ENUM('PERFIL', 'GERENCIA', 'AGENDA', 'NUEVA', 'DEFAULT', 'USUARIO') NULL,
    MODIFY `estado` ENUM('PENDIENTE', 'RECHAZADA', 'EN_FABRICACION', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE';

-- CreateTable
CREATE TABLE `DireccionAgenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `codigoPostal` VARCHAR(191) NOT NULL,
    `localidad` VARCHAR(191) NOT NULL,
    `provincia` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DireccionAgenda_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Solicitud_areaId_idx` ON `Solicitud`(`areaId`);

-- CreateIndex
CREATE INDEX `Solicitud_imputadoId_idx` ON `Solicitud`(`imputadoId`);

-- CreateIndex
CREATE INDEX `Solicitud_anio_idx` ON `Solicitud`(`anio`);

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_agendaDireccionId_fkey` FOREIGN KEY (`agendaDireccionId`) REFERENCES `DireccionAgenda`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DireccionAgenda` ADD CONSTRAINT `DireccionAgenda_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
