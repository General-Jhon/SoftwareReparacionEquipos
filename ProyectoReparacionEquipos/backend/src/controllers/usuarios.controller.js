import bcrypt from "bcryptjs";

import { pool } from "../db.js";
import { badRequest } from "../utils/http.js";

const asInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

const getAdminRoleId = async () => {
  const [[role]] = await pool.query("SELECT id FROM roles WHERE nombre = 'Administrador' LIMIT 1");
  return role?.id || null;
};

const countActiveAdmins = async () => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE r.nombre = 'Administrador' AND u.activo = 1`
  );
  return Number(rows?.[0]?.total || 0);
};

const syncTecnicoFromUser = async ({ id, rolNombre, nombre, apellido, email, telefono, activo }) => {
  if (rolNombre !== "Tecnico") return;
  const [rows] = await pool.query("SELECT id FROM tecnicos WHERE email = ? LIMIT 1", [email]);
  if (rows.length > 0) {
    await pool.query(
      "UPDATE tecnicos SET nombre = ?, apellido = ?, telefono = ?, email = ?, activo = ? WHERE id = ?",
      [nombre, apellido, telefono || null, email, activo ? 1 : 0, rows[0].id]
    );
    return;
  }
  await pool.query(
    "INSERT INTO tecnicos (nombre, apellido, telefono, email, especialidad, activo) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, apellido, telefono || null, email, null, activo ? 1 : 0]
  );
};

export const listUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.activo, u.creado_en,
              u.actualizado_en, u.cliente_id, r.id AS rol_id, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       ORDER BY u.id DESC
       LIMIT 300`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const listRoles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, descripcion FROM roles ORDER BY FIELD(nombre, 'Administrador', 'Recepcion', 'Tecnico', 'Cliente'), id"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const createUsuario = async (req, res) => {
  const { nombre, apellido, email, telefono, rol_id, password, activo } = req.body || {};

  if (!nombre || !apellido || !email || !rol_id || !password) {
    return badRequest(res, "nombre, apellido, email, rol_id y password son requeridos");
  }

  if (String(password).length < 8) {
    return badRequest(res, "password debe tener al menos 8 caracteres");
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [[role]] = await connection.query("SELECT id, nombre FROM roles WHERE id = ? LIMIT 1", [rol_id]);
    if (!role) {
      await connection.rollback();
      return badRequest(res, "rol_id invalido");
    }

    let clienteId = null;
    if (role.nombre === "Cliente") {
      const [clienteResult] = await connection.query(
        `INSERT INTO clientes (nombre, apellido, telefono, email)
         VALUES (?, ?, ?, ?)`,
        [nombre, apellido, telefono || null, email]
      );
      clienteId = clienteResult.insertId;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await connection.query(
      `INSERT INTO usuarios (rol_id, cliente_id, nombre, apellido, email, telefono, password_hash, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [role.id, clienteId, nombre, apellido, email, telefono || null, passwordHash, activo === false ? 0 : 1]
    );

    await connection.commit();

    await syncTecnicoFromUser({
      id: result.insertId,
      rolNombre: role.nombre,
      nombre,
      apellido,
      email,
      telefono,
      activo: activo !== false,
    });

    res.status(201).json({ id: result.insertId, cliente_id: clienteId });
  } catch (err) {
    if (connection) await connection.rollback();
    const message = String(err.message || err);
    if (message.toLowerCase().includes("duplicate")) {
      return res.status(409).json({ error: "email ya registrado" });
    }
    res.status(500).json({ error: message });
  } finally {
    if (connection) connection.release();
  }
};

export const updateUsuario = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");

  const { nombre, apellido, email, telefono, rol_id, activo } = req.body || {};
  if (!nombre || !apellido || !email || !rol_id) {
    return badRequest(res, "nombre, apellido, email y rol_id son requeridos");
  }

  try {
    const [[current]] = await pool.query(
      `SELECT u.id, u.rol_id, u.cliente_id, u.activo, r.nombre AS rol_nombre
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ? LIMIT 1`,
      [id]
    );
    if (!current) return res.status(404).json({ error: "usuario no encontrado" });

    const [[targetRole]] = await pool.query("SELECT id, nombre FROM roles WHERE id = ? LIMIT 1", [rol_id]);
    if (!targetRole) return badRequest(res, "rol_id invalido");

    const adminRoleId = await getAdminRoleId();
    const becomingNotAdmin = Number(current.rol_id) === Number(adminRoleId) && Number(targetRole.id) !== Number(adminRoleId);
    const disablingAdmin = Number(current.rol_id) === Number(adminRoleId) && activo === false;

    if ((becomingNotAdmin || disablingAdmin) && Number(req.user?.id) === Number(id)) {
      return res.status(400).json({ error: "no puedes quitarte permisos de administrador a ti mismo" });
    }

    if (becomingNotAdmin || disablingAdmin) {
      const totalAdmins = await countActiveAdmins();
      if (totalAdmins <= 1 && current.activo) {
        return res.status(400).json({ error: "no se puede dejar el sistema sin administradores activos" });
      }
    }

    let clienteIdFinal = current.cliente_id || null;
    if (targetRole.nombre === "Cliente") {
      if (clienteIdFinal) {
        await pool.query(
          `UPDATE clientes
           SET nombre = ?, apellido = ?, telefono = ?, email = ?
           WHERE id = ?`,
          [nombre, apellido, telefono || null, email, clienteIdFinal]
        );
      } else {
        const [clienteResult] = await pool.query(
          `INSERT INTO clientes (nombre, apellido, telefono, email)
           VALUES (?, ?, ?, ?)`,
          [nombre, apellido, telefono || null, email]
        );
        clienteIdFinal = clienteResult.insertId;
      }
    }

    await pool.query(
      `UPDATE usuarios
       SET nombre = ?, apellido = ?, email = ?, telefono = ?, rol_id = ?, cliente_id = ?, activo = ?
       WHERE id = ?`,
      [nombre, apellido, email, telefono || null, targetRole.id, clienteIdFinal, activo === false ? 0 : 1, id]
    );

    await syncTecnicoFromUser({
      id,
      rolNombre: targetRole.nombre,
      nombre,
      apellido,
      email,
      telefono,
      activo: activo !== false,
    });

    res.json({ ok: true });
  } catch (err) {
    const message = String(err.message || err);
    if (message.toLowerCase().includes("duplicate")) {
      return res.status(409).json({ error: "email ya registrado" });
    }
    res.status(500).json({ error: message });
  }
};

export const resetUsuarioPassword = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");

  const { new_password } = req.body || {};
  if (!new_password) return badRequest(res, "new_password es requerido");
  if (String(new_password).length < 8) {
    return badRequest(res, "new_password debe tener al menos 8 caracteres");
  }

  try {
    const [[current]] = await pool.query("SELECT id FROM usuarios WHERE id = ? LIMIT 1", [id]);
    if (!current) return res.status(404).json({ error: "usuario no encontrado" });

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE usuarios SET password_hash = ? WHERE id = ?", [hash, id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const deleteUsuario = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");

  try {
    const [[current]] = await pool.query(
      `SELECT u.id, u.activo, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ? LIMIT 1`,
      [id]
    );
    if (!current) return res.status(404).json({ error: "usuario no encontrado" });

    if (Number(req.user?.id) === Number(id)) {
      return res.status(400).json({ error: "no puedes eliminar tu propio usuario" });
    }

    if (current.rol === "Administrador" && current.activo) {
      const totalAdmins = await countActiveAdmins();
      if (totalAdmins <= 1) {
        return res.status(400).json({ error: "no se puede eliminar el ultimo administrador activo" });
      }
    }

    const [result] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "usuario no encontrado" });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
