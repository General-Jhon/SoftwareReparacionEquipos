-- Migration: add cliente linkage, pagos, and order payment fields
-- Fecha: 2026-02-07

USE TallerBD;

-- Add Cliente role if missing
INSERT INTO roles (nombre, descripcion) VALUES
  ('Cliente', 'Consulta y pago de ordenes')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- usuarios.cliente_id
ALTER TABLE usuarios
  ADD COLUMN cliente_id INT UNSIGNED NULL AFTER rol_id;

ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuarios_clientes
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- equipos.serie required (if you have NULLs, fix them before this)
-- UPDATE equipos SET serie = CONCAT('SN-', id) WHERE serie IS NULL;
ALTER TABLE equipos
  MODIFY serie VARCHAR(80) NOT NULL;

-- ordenes_servicio payment fields
ALTER TABLE ordenes_servicio
  ADD COLUMN saldo DECIMAL(10,2) NULL AFTER costo_final,
  ADD COLUMN pagado TINYINT(1) NOT NULL DEFAULT 0 AFTER saldo;

-- pagos table
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
