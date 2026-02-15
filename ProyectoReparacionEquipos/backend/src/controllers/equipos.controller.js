import { pool } from "../db.js";
import { badRequest } from "../utils/http.js";

const asInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

export const listEquipos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.marca, e.modelo, e.serie, e.color, e.accesorios, e.descripcion,
              e.cliente_id, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
              e.tipo_id, t.nombre AS tipo_nombre
       FROM equipos e
       JOIN clientes c ON c.id = e.cliente_id
       LEFT JOIN tipos_equipo t ON t.id = e.tipo_id
       ORDER BY e.id DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const getEquipo = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [rows] = await pool.query(
      "SELECT id, cliente_id, tipo_id, marca, modelo, serie, color, accesorios, descripcion FROM equipos WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "equipo no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const createEquipo = async (req, res) => {
  const { cliente_id, tipo_id, marca, modelo, serie, color, accesorios, descripcion } = req.body || {};
  if (!cliente_id || !marca || !serie) return badRequest(res, "cliente_id, marca y serie son requeridos");
  try {
    const [result] = await pool.query(
      "INSERT INTO equipos (cliente_id, tipo_id, marca, modelo, serie, color, accesorios, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [cliente_id, tipo_id || null, marca, modelo || null, serie, color || null, accesorios || null, descripcion || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const updateEquipo = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  const { cliente_id, tipo_id, marca, modelo, serie, color, accesorios, descripcion } = req.body || {};
  if (!cliente_id || !marca || !serie) return badRequest(res, "cliente_id, marca y serie son requeridos");
  try {
    const [result] = await pool.query(
      "UPDATE equipos SET cliente_id = ?, tipo_id = ?, marca = ?, modelo = ?, serie = ?, color = ?, accesorios = ?, descripcion = ? WHERE id = ?",
      [cliente_id, tipo_id || null, marca, modelo || null, serie, color || null, accesorios || null, descripcion || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "equipo no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const deleteEquipo = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [result] = await pool.query("DELETE FROM equipos WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "equipo no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
