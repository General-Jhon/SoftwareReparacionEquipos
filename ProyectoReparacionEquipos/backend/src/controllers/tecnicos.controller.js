import { pool } from "../db.js";
import { badRequest } from "../utils/http.js";

export const listTecnicos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, telefono, email, especialidad, activo FROM tecnicos ORDER BY id DESC LIMIT 200"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const createTecnico = async (req, res) => {
  const { nombre, apellido, telefono, email, especialidad, activo } = req.body || {};
  if (!nombre || !apellido) return badRequest(res, "nombre y apellido son requeridos");
  try {
    const [result] = await pool.query(
      "INSERT INTO tecnicos (nombre, apellido, telefono, email, especialidad, activo) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, apellido, telefono || null, email || null, especialidad || null, activo === undefined ? 1 : activo ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const updateTecnico = async (req, res) => {
  const { id } = req.params;
  const tecnicoId = Number(id);
  if (!Number.isInteger(tecnicoId)) return badRequest(res, "id invalido");
  const { nombre, apellido, telefono, email, especialidad, activo } = req.body || {};
  if (!nombre || !apellido) return badRequest(res, "nombre y apellido son requeridos");
  try {
    const [result] = await pool.query(
      "UPDATE tecnicos SET nombre = ?, apellido = ?, telefono = ?, email = ?, especialidad = ?, activo = ? WHERE id = ?",
      [nombre, apellido, telefono || null, email || null, especialidad || null, activo === undefined ? 1 : activo ? 1 : 0, tecnicoId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "tecnico no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const deleteTecnico = async (req, res) => {
  const { id } = req.params;
  const tecnicoId = Number(id);
  if (!Number.isInteger(tecnicoId)) return badRequest(res, "id invalido");
  try {
    const [result] = await pool.query("DELETE FROM tecnicos WHERE id = ?", [tecnicoId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "tecnico no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
