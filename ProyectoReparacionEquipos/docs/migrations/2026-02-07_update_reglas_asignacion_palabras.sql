-- Migration: expand keyword rules to allow multiple keywords per rule
-- Fecha: 2026-02-07

USE TallerBD;

ALTER TABLE reglas_asignacion
  CHANGE COLUMN palabra_clave palabras_clave VARCHAR(255) NOT NULL;
