import { pool } from "../db.js";
import { badRequest } from "../utils/http.js";

const asInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

export const listReglas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.palabras_clave, r.grupo_id, g.nombre AS grupo_nombre,
              r.tecnico_id, t.nombre AS tecnico_nombre, t.apellido AS tecnico_apellido,
              r.prioridad, r.activo
       FROM reglas_asignacion r
       JOIN grupos_responsables g ON g.id = r.grupo_id
       LEFT JOIN tecnicos t ON t.id = r.tecnico_id
       ORDER BY r.prioridad DESC, r.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const createRegla = async (req, res) => {
  const { palabras_clave, grupo_id, tecnico_id, prioridad, activo } = req.body || {};
  if (!palabras_clave || !grupo_id) return badRequest(res, "palabras_clave y grupo_id son requeridos");
  try {
    const [result] = await pool.query(
      "INSERT INTO reglas_asignacion (palabras_clave, grupo_id, tecnico_id, prioridad, activo) VALUES (?, ?, ?, ?, ?)",
      [
        palabras_clave,
        grupo_id,
        tecnico_id || null,
        prioridad === undefined ? 1 : prioridad,
        activo === undefined ? 1 : activo ? 1 : 0,
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const updateRegla = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  const { palabras_clave, grupo_id, tecnico_id, prioridad, activo } = req.body || {};
  if (!palabras_clave || !grupo_id) return badRequest(res, "palabras_clave y grupo_id son requeridos");
  try {
    const [result] = await pool.query(
      `UPDATE reglas_asignacion
       SET palabras_clave = ?, grupo_id = ?, tecnico_id = ?, prioridad = ?, activo = ?
       WHERE id = ?`,
      [
        palabras_clave,
        grupo_id,
        tecnico_id || null,
        prioridad === undefined ? 1 : prioridad,
        activo === undefined ? 1 : activo ? 1 : 0,
        id,
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "regla no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const deleteRegla = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [result] = await pool.query("DELETE FROM reglas_asignacion WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "regla no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
