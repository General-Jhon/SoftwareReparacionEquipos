-- Migration: add reglas de asignacion por palabras clave
-- Fecha: 2026-02-07

USE TallerBD;

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
