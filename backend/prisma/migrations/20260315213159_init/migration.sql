-- CreateTable
CREATE TABLE `Zona` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `localidad` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Zona_nombre_key`(`nombre`),
    INDEX `Zona_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NULL,
    `apellido1` VARCHAR(191) NULL,
    `apellido2` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `avatarEntraId` VARCHAR(191) NULL,
    `numeroSAP` VARCHAR(191) NULL,
    `nombreCompleto` VARCHAR(191) NULL,
    `rol` ENUM('ADMIN', 'GERENTE', 'DELEGADO') NOT NULL DEFAULT 'DELEGADO',
    `zonaId` INTEGER NULL,
    `direccion` VARCHAR(191) NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `localidad` VARCHAR(191) NULL,
    `provincia` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `nif` VARCHAR(191) NULL,
    `destMercancia` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `Usuario_email_idx`(`email`),
    INDEX `Usuario_rol_idx`(`rol`),
    INDEX `Usuario_activo_idx`(`activo`),
    INDEX `Usuario_zonaId_idx`(`zonaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Establecimiento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('FARMACIA', 'CLINICA') NOT NULL DEFAULT 'FARMACIA',
    `nombre` VARCHAR(191) NOT NULL,
    `nif` VARCHAR(191) NULL,
    `codigoInterno` VARCHAR(191) NULL,
    `codigoERP` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `localidad` VARCHAR(191) NULL,
    `provincia` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `lengua` ENUM('ES', 'CA', 'EU', 'GL') NOT NULL DEFAULT 'ES',
    `sanibrick` VARCHAR(191) NULL,
    `territoryDescr` VARCHAR(191) NULL,
    `panel` VARCHAR(191) NULL,
    `ubicacion` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `zonaId` INTEGER NULL,
    `delegadoId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Establecimiento_nif_key`(`nif`),
    INDEX `Establecimiento_zonaId_idx`(`zonaId`),
    INDEX `Establecimiento_delegadoId_idx`(`delegadoId`),
    INDEX `Establecimiento_nif_idx`(`nif`),
    INDEX `Establecimiento_activo_idx`(`activo`),
    INDEX `Establecimiento_tipo_idx`(`tipo`),
    INDEX `Establecimiento_codigoInterno_idx`(`codigoInterno`),
    INDEX `Establecimiento_codigoERP_idx`(`codigoERP`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proveedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `nif` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `localidad` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `contacto` VARCHAR(191) NULL,
    `observaciones` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Proveedor_nif_key`(`nif`),
    INDEX `Proveedor_activo_idx`(`activo`),
    INDEX `Proveedor_nif_idx`(`nif`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProveedorEmail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proveedorId` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `tipo` ENUM('DEFAULT', 'PRESUPUESTOS', 'PRODUCCION', 'FACTURACION') NOT NULL DEFAULT 'DEFAULT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProveedorEmail_proveedorId_idx`(`proveedorId`),
    UNIQUE INDEX `ProveedorEmail_proveedorId_tipo_key`(`proveedorId`, `tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Marca` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Marca_nombre_key`(`nombre`),
    INDEX `Marca_nombre_idx`(`nombre`),
    INDEX `Marca_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Material` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `marcaId` INTEGER NULL,
    `proveedorId` INTEGER NULL,
    `descripcion` TEXT NULL,
    `imagen` VARCHAR(191) NULL,
    `thumbnail` VARCHAR(191) NULL,
    `imagenes` TEXT NULL,
    `precio` DOUBLE NULL,
    `precioPublico` DOUBLE NULL,
    `tipoPrecio` ENUM('UNIDAD', 'METRO2') NOT NULL DEFAULT 'UNIDAD',
    `orientacion` ENUM('HORIZONTAL', 'VERTICAL', 'CUADRADO') NULL,
    `permiteAltoAncho` BOOLEAN NOT NULL DEFAULT false,
    `permitePersonalizar` BOOLEAN NOT NULL DEFAULT false,
    `requiereNombreFarmacia` BOOLEAN NOT NULL DEFAULT false,
    `permiteTalla` BOOLEAN NOT NULL DEFAULT false,
    `permitePersonalizacionBata` BOOLEAN NOT NULL DEFAULT false,
    `permiteMarca` BOOLEAN NOT NULL DEFAULT false,
    `visibleParaDelegado` BOOLEAN NOT NULL DEFAULT true,
    `tipoEstablecimiento` ENUM('FARMACIA', 'CLINICA') NULL,
    `permiteEvento` BOOLEAN NOT NULL DEFAULT false,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Material_codigo_key`(`codigo`),
    INDEX `Material_marcaId_idx`(`marcaId`),
    INDEX `Material_proveedorId_idx`(`proveedorId`),
    INDEX `Material_activo_idx`(`activo`),
    INDEX `Material_codigo_idx`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracion` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `limiteUsuarioAnual` DOUBLE NULL,
    `soporteNombre` VARCHAR(191) NULL,
    `soporteEmail` VARCHAR(191) NULL,
    `soporteTelefono` VARCHAR(191) NULL,
    `appNombre` VARCHAR(191) NULL DEFAULT 'App Material Farmacias',
    `avisoActivo` BOOLEAN NOT NULL DEFAULT false,
    `avisoTexto` TEXT NULL,
    `emailAdmin` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Solicitud` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `establecimientoId` INTEGER NULL,
    `eventoNombre` VARCHAR(191) NULL,
    `materialId` INTEGER NOT NULL,
    `estado` ENUM('PENDIENTE', 'RECHAZADA', 'EN_FABRICACION', 'ENVIADA', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
    `importeTotal` DOUBLE NOT NULL DEFAULT 0,
    `altoCm` INTEGER NULL,
    `anchoCm` INTEGER NULL,
    `orientacion` ENUM('HORIZONTAL', 'VERTICAL', 'CUADRADO') NULL,
    `personalizarNombre` BOOLEAN NOT NULL DEFAULT false,
    `descripcionPersonalizada` TEXT NULL,
    `talla` ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NULL,
    `personalizacionBata` TEXT NULL,
    `marcasBata` VARCHAR(191) NULL,
    `marcaId` INTEGER NULL,
    `direccionEntrega` VARCHAR(191) NULL,
    `codigoPostalEntrega` VARCHAR(191) NULL,
    `localidadEntrega` VARCHAR(191) NULL,
    `provinciaEntrega` VARCHAR(191) NULL,
    `telefonoEntrega` VARCHAR(191) NULL,
    `proveedorEnviadoId` INTEGER NULL,
    `direccionEntregaFinal` VARCHAR(191) NULL,
    `codigoPostalEntregaFinal` VARCHAR(191) NULL,
    `localidadEntregaFinal` VARCHAR(191) NULL,
    `provinciaEntregaFinal` VARCHAR(191) NULL,
    `telefonoEntregaFinal` VARCHAR(191) NULL,
    `tokenFabricante` VARCHAR(191) NULL,
    `archivosPersonalizacion` TEXT NULL,
    `avisoLimiteUsuario` BOOLEAN NOT NULL DEFAULT false,
    `observaciones` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `aprobadaEn` DATETIME(3) NULL,
    `rechazadaEn` DATETIME(3) NULL,
    `enviadaProveedorEn` DATETIME(3) NULL,
    `completadaEn` DATETIME(3) NULL,

    UNIQUE INDEX `Solicitud_tokenFabricante_key`(`tokenFabricante`),
    INDEX `Solicitud_usuarioId_idx`(`usuarioId`),
    INDEX `Solicitud_establecimientoId_idx`(`establecimientoId`),
    INDEX `Solicitud_materialId_idx`(`materialId`),
    INDEX `Solicitud_marcaId_idx`(`marcaId`),
    INDEX `Solicitud_proveedorEnviadoId_idx`(`proveedorEnviadoId`),
    INDEX `Solicitud_estado_idx`(`estado`),
    INDEX `Solicitud_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FotoInstalacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitudId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FotoInstalacion_solicitudId_idx`(`solicitudId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gerencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `direccion` VARCHAR(191) NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `localidad` VARCHAR(191) NULL,
    `provincia` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Gerencia_nombre_key`(`nombre`),
    INDEX `Gerencia_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GerenciaZona` (
    `gerenciaId` INTEGER NOT NULL,
    `zonaId` INTEGER NOT NULL,

    PRIMARY KEY (`gerenciaId`, `zonaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `Zona`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Establecimiento` ADD CONSTRAINT `Establecimiento_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `Zona`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Establecimiento` ADD CONSTRAINT `Establecimiento_delegadoId_fkey` FOREIGN KEY (`delegadoId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProveedorEmail` ADD CONSTRAINT `ProveedorEmail_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Material` ADD CONSTRAINT `Material_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `Marca`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Material` ADD CONSTRAINT `Material_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_marcaId_fkey` FOREIGN KEY (`marcaId`) REFERENCES `Marca`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_proveedorEnviadoId_fkey` FOREIGN KEY (`proveedorEnviadoId`) REFERENCES `Proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_establecimientoId_fkey` FOREIGN KEY (`establecimientoId`) REFERENCES `Establecimiento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FotoInstalacion` ADD CONSTRAINT `FotoInstalacion_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `Solicitud`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GerenciaZona` ADD CONSTRAINT `GerenciaZona_gerenciaId_fkey` FOREIGN KEY (`gerenciaId`) REFERENCES `Gerencia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GerenciaZona` ADD CONSTRAINT `GerenciaZona_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `Zona`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
