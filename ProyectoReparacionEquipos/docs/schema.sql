-- Schema base para TallerBD
-- Fecha: 2026-02-07

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Crea la base de datos si no existe
CREATE DATABASE IF NOT EXISTS TallerBD
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE TallerBD;

-- Roles del sistema
CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  documento VARCHAR(30) NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(120) NULL,
  direccion VARCHAR(200) NULL,
  ciudad VARCHAR(80) NULL,
  notas TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_clientes_documento (documento)
) ENGINE=InnoDB;

-- Usuarios (para login)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rol_id INT UNSIGNED NOT NULL,
  cliente_id INT UNSIGNED NULL,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  telefono VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_roles
    FOREIGN KEY (rol_id) REFERENCES roles(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_usuarios_clientes
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(120) NULL UNIQUE,
  especialidad VARCHAR(120) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Grupos responsables
CREATE TABLE IF NOT EXISTS grupos_responsables (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Relación técnico <-> grupos
CREATE TABLE IF NOT EXISTS tecnico_grupos (
  tecnico_id INT UNSIGNED NOT NULL,
  grupo_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (tecnico_id, grupo_id),
  CONSTRAINT fk_tecnico_grupos_tecnico
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_tecnico_grupos_grupo
    FOREIGN KEY (grupo_id) REFERENCES grupos_responsables(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Reglas de asignación por palabras clave
CREATE TABLE IF NOT EXISTS reglas_asignacion (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  palabras_clave VARCHAR(255) NOT NULL,
  grupo_id INT UNSIGNED NOT NULL,
  tecnico_id INT UNSIGNED NULL,
  prioridad INT NOT NULL DEFAULT 1,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reglas_grupo
    FOREIGN KEY (grupo_id) REFERENCES grupos_responsables(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reglas_tecnico
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Catálogo de tipos de equipo (PC, laptop, impresora, etc.)
CREATE TABLE IF NOT EXISTS tipos_equipo (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  tipo_id INT UNSIGNED NULL,
  marca VARCHAR(60) NOT NULL,
  modelo VARCHAR(80) NULL,
  serie VARCHAR(80) NOT NULL,
  color VARCHAR(40) NULL,
  accesorios VARCHAR(255) NULL,
  descripcion TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_equipos_clientes
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_equipos_tipos
    FOREIGN KEY (tipo_id) REFERENCES tipos_equipo(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  UNIQUE KEY uq_equipos_serie (serie)
) ENGINE=InnoDB;

-- Estados de orden (Recibido, Diagnóstico, Reparación, Listo, Entregado)
CREATE TABLE IF NOT EXISTS estados_orden (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(40) NOT NULL UNIQUE,
  orden INT NOT NULL
) ENGINE=InnoDB;

-- Ordenes de servicio
CREATE TABLE IF NOT EXISTS ordenes_servicio (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  cliente_id INT UNSIGNED NOT NULL,
  equipo_id INT UNSIGNED NOT NULL,
  tecnico_id INT UNSIGNED NULL,
  grupo_id INT UNSIGNED NULL,
  estado_id INT UNSIGNED NOT NULL,
  fecha_recepcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega_estimada DATETIME NULL,
  fecha_entrega_real DATETIME NULL,
  falla_reportada TEXT NOT NULL,
  diagnostico TEXT NULL,
  observaciones TEXT NULL,
  costo_estimado DECIMAL(10,2) NULL,
  costo_final DECIMAL(10,2) NULL,
  saldo DECIMAL(10,2) NULL,
  pagado TINYINT(1) NOT NULL DEFAULT 0,
  garantia_dias INT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ordenes_clientes
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ordenes_equipos
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ordenes_tecnicos
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_ordenes_grupos
    FOREIGN KEY (grupo_id) REFERENCES grupos_responsables(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_ordenes_estados
    FOREIGN KEY (estado_id) REFERENCES estados_orden(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Pagos
CREATE TABLE IF NOT EXISTS pagos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  orden_id INT UNSIGNED NOT NULL,
  cliente_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NULL,
  metodo VARCHAR(40) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  referencia VARCHAR(80) NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagos_orden
    FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pagos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pagos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Historial de cambios de estado
CREATE TABLE IF NOT EXISTS ordenes_historial (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  orden_id INT UNSIGNED NOT NULL,
  estado_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NULL,
  comentario TEXT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historial_orden
    FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_historial_estado
    FOREIGN KEY (estado_id) REFERENCES estados_orden(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_historial_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Inserciones iniciales
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Control total del sistema'),
  ('Cliente', 'Consulta y pago de ordenes'),
  ('Tecnico', 'Gestiona diagnosticos y reparaciones'),
  ('Recepcion', 'Registra clientes y equipos')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO estados_orden (nombre, orden) VALUES
  ('Recibido', 1),
  ('En Diagnostico', 2),
  ('En Reparacion', 3),
  ('Listo', 4),
  ('Entregado', 5)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tipos_equipo (nombre) VALUES
  ('PC'),
  ('Laptop'),
  ('Impresora'),
  ('Monitor'),
  ('Tablet'),
  ('Celular')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
