import { pool } from "../db.js";
import { badRequest } from "../utils/http.js";

const asInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

export const listGrupos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, descripcion, activo FROM grupos_responsables ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const createGrupo = async (req, res) => {
  const { nombre, descripcion, activo } = req.body || {};
  if (!nombre) return badRequest(res, "nombre es requerido");
  try {
    const [result] = await pool.query(
      "INSERT INTO grupos_responsables (nombre, descripcion, activo) VALUES (?, ?, ?)",
      [nombre, descripcion || null, activo === undefined ? 1 : activo ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const updateGrupo = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  const { nombre, descripcion, activo } = req.body || {};
  if (!nombre) return badRequest(res, "nombre es requerido");
  try {
    const [result] = await pool.query(
      "UPDATE grupos_responsables SET nombre = ?, descripcion = ?, activo = ? WHERE id = ?",
      [nombre, descripcion || null, activo === undefined ? 1 : activo ? 1 : 0, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "grupo no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const deleteGrupo = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [result] = await pool.query("DELETE FROM grupos_responsables WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "grupo no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const addTecnicoToGrupo = async (req, res) => {
  const tecnicoId = asInt(req.params.id);
  const { grupo_id } = req.body || {};
  if (!tecnicoId || !grupo_id) return badRequest(res, "tecnico_id y grupo_id son requeridos");
  try {
    await pool.query("INSERT IGNORE INTO tecnico_grupos (tecnico_id, grupo_id) VALUES (?, ?)", [
      tecnicoId,
      grupo_id,
    ]);
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const removeTecnicoFromGrupo = async (req, res) => {
  const tecnicoId = asInt(req.params.id);
  const grupoId = asInt(req.params.grupoId);
  if (!tecnicoId || !grupoId) return badRequest(res, "id invalido");
  try {
    const [result] = await pool.query("DELETE FROM tecnico_grupos WHERE tecnico_id = ? AND grupo_id = ?", [
      tecnicoId,
      grupoId,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "relacion no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const listTecnicosByGrupo = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.nombre, t.apellido, t.email, t.telefono, t.especialidad, t.activo
       FROM tecnico_grupos tg
       JOIN tecnicos t ON t.id = tg.tecnico_id
       WHERE tg.grupo_id = ?
       ORDER BY t.apellido ASC, t.nombre ASC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
