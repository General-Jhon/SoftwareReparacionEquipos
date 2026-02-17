import { pool } from "../db.js";
import { badRequest } from "../utils/http.js";

const asInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

export const listClientes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, documento, telefono, email, direccion, ciudad, notas FROM clientes ORDER BY id DESC LIMIT 200"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const getCliente = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, documento, telefono, email, direccion, ciudad, notas FROM clientes WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "cliente no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const getMiPerfilCliente = async (req, res) => {
  const clienteId = Number(req.user?.cliente_id || 0);
  if (!clienteId) return res.status(403).json({ error: "cliente no asociado" });
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, documento, telefono, email, direccion, ciudad, notas FROM clientes WHERE id = ? LIMIT 1",
      [clienteId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "cliente no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const createCliente = async (req, res) => {
  const { nombre, apellido, documento, telefono, email, direccion, ciudad, notas } = req.body || {};
  if (!nombre || !apellido) return badRequest(res, "nombre y apellido son requeridos");
  try {
    const [result] = await pool.query(
      "INSERT INTO clientes (nombre, apellido, documento, telefono, email, direccion, ciudad, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [nombre, apellido, documento || null, telefono || null, email || null, direccion || null, ciudad || null, notas || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const updateCliente = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  const { nombre, apellido, documento, telefono, email, direccion, ciudad, notas } = req.body || {};
  if (!nombre || !apellido) return badRequest(res, "nombre y apellido son requeridos");
  try {
    const [result] = await pool.query(
      "UPDATE clientes SET nombre = ?, apellido = ?, documento = ?, telefono = ?, email = ?, direccion = ?, ciudad = ?, notas = ? WHERE id = ?",
      [nombre, apellido, documento || null, telefono || null, email || null, direccion || null, ciudad || null, notas || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "cliente no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const updateMiPerfilCliente = async (req, res) => {
  const clienteId = Number(req.user?.cliente_id || 0);
  if (!clienteId) return res.status(403).json({ error: "cliente no asociado" });
  const { nombre, apellido, telefono, direccion, ciudad } = req.body || {};
  if (!nombre || !apellido) return badRequest(res, "nombre y apellido son requeridos");
  try {
    const [result] = await pool.query(
      "UPDATE clientes SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, ciudad = ? WHERE id = ?",
      [nombre, apellido, telefono || null, direccion || null, ciudad || null, clienteId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "cliente no encontrado" });

    // Mantiene sincronizado el nombre/teléfono visible en la cuenta de usuario
    await pool.query(
      "UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ? WHERE id = ?",
      [nombre, apellido, telefono || null, req.user.id]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const deleteCliente = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [result] = await pool.query("DELETE FROM clientes WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "cliente no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
