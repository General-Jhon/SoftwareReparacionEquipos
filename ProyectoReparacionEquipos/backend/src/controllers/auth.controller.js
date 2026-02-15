import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { pool } from "../db.js";
import { badRequest } from "../utils/http.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_me_please";

const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

export const login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return badRequest(res, "email y password son requeridos");
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, u.activo, u.cliente_id, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.email = ? LIMIT 1`,
      [email]
    );
    if (rows.length === 0) return res.status(401).json({ error: "credenciales invalidas" });
    const user = rows[0];
    if (!user.activo) return res.status(403).json({ error: "usuario inactivo" });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "credenciales invalidas" });

    const token = signToken({ id: user.id, rol: user.rol, email: user.email, cliente_id: user.cliente_id || null });
    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        cliente_id: user.cliente_id || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const registerCliente = async (req, res) => {
  const { nombre, apellido, documento, telefono, email, direccion, ciudad, password } = req.body || {};
  if (!nombre || !apellido || !email || !password) {
    return badRequest(res, "nombre, apellido, email y password son requeridos");
  }
  try {
    const [[role]] = await pool.query("SELECT id FROM roles WHERE nombre = 'Cliente' LIMIT 1");
    if (!role) return res.status(500).json({ error: "rol Cliente no existe" });

    const passwordHash = await bcrypt.hash(password, 10);
    const [clienteResult] = await pool.query(
      `INSERT INTO clientes (nombre, apellido, documento, telefono, email, direccion, ciudad)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, documento || null, telefono || null, email, direccion || null, ciudad || null]
    );

    const [userResult] = await pool.query(
      `INSERT INTO usuarios (rol_id, cliente_id, nombre, apellido, email, telefono, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [role.id, clienteResult.insertId, nombre, apellido, email, telefono || null, passwordHash]
    );

    res.status(201).json({ id: userResult.insertId, cliente_id: clienteResult.insertId });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
