-- Migration: add grupos responsables and assignment to orders
-- Fecha: 2026-02-07

USE TallerBD;

CREATE TABLE IF NOT EXISTS grupos_responsables (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

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

ALTER TABLE ordenes_servicio
  ADD COLUMN grupo_id INT UNSIGNED NULL AFTER tecnico_id;

ALTER TABLE ordenes_servicio
  ADD CONSTRAINT fk_ordenes_grupos
    FOREIGN KEY (grupo_id) REFERENCES grupos_responsables(id)
    ON UPDATE CASCADE ON DELETE SET NULL;
