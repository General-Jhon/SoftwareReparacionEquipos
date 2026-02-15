import { pool } from "../db.js";

export const getEstados = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre, orden FROM estados_orden ORDER BY orden ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const getTiposEquipo = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre FROM tipos_equipo ORDER BY nombre ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
