import { pool } from "../db.js";
import { badRequest } from "../utils/http.js";
import { normalizeText } from "../utils/text.js";

const asInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

export const listOrdenes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.codigo, o.fecha_recepcion, o.fecha_entrega_estimada, o.fecha_entrega_real,
              o.falla_reportada, o.diagnostico, o.observaciones, o.costo_estimado, o.costo_final,
              o.saldo, o.pagado, o.garantia_dias, o.estado_id, s.nombre AS estado_nombre,
              o.cliente_id, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
              o.equipo_id, e.marca, e.modelo, e.serie,
              o.tecnico_id, t.nombre AS tecnico_nombre, t.apellido AS tecnico_apellido,
              o.grupo_id
       FROM ordenes_servicio o
       JOIN clientes c ON c.id = o.cliente_id
       JOIN equipos e ON e.id = o.equipo_id
       JOIN estados_orden s ON s.id = o.estado_id
       LEFT JOIN tecnicos t ON t.id = o.tecnico_id
       ORDER BY o.id DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const getOrden = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [[orden]] = await pool.query("SELECT * FROM ordenes_servicio WHERE id = ?", [id]);
    if (!orden) return res.status(404).json({ error: "orden no encontrada" });
    const [historial] = await pool.query(
      `SELECT h.id, h.estado_id, s.nombre AS estado_nombre, h.usuario_id, h.comentario, h.fecha
       FROM ordenes_historial h
       JOIN estados_orden s ON s.id = h.estado_id
       WHERE h.orden_id = ?
       ORDER BY h.fecha ASC`,
      [id]
    );
    res.json({ orden, historial });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const createOrden = async (req, res) => {
  const {
    codigo,
    cliente_id,
    equipo_id,
    tecnico_id,
    grupo_id,
    estado_id,
    fecha_recepcion,
    fecha_entrega_estimada,
    falla_reportada,
    diagnostico,
    observaciones,
    costo_estimado,
    costo_final,
    garantia_dias,
  } = req.body || {};

  if (!codigo || !cliente_id || !equipo_id || !falla_reportada) {
    return badRequest(res, "codigo, cliente_id, equipo_id y falla_reportada son requeridos");
  }

  try {
    let estadoFinalId = estado_id;
    if (!estadoFinalId) {
      const [[estadoRecibido]] = await pool.query("SELECT id FROM estados_orden WHERE nombre = 'Recibido' LIMIT 1");
      if (!estadoRecibido) return res.status(500).json({ error: "estado Recibido no existe" });
      estadoFinalId = estadoRecibido.id;
    }

    const [result] = await pool.query(
      `INSERT INTO ordenes_servicio
        (codigo, cliente_id, equipo_id, tecnico_id, grupo_id, estado_id, fecha_recepcion, fecha_entrega_estimada,
         falla_reportada, diagnostico, observaciones, costo_estimado, costo_final, garantia_dias)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo,
        cliente_id,
        equipo_id,
        tecnico_id || null,
        grupo_id || null,
        estadoFinalId,
        fecha_recepcion || new Date(),
        fecha_entrega_estimada || null,
        falla_reportada,
        diagnostico || null,
        observaciones || null,
        costo_estimado || null,
        costo_final || null,
        garantia_dias || null,
      ]
    );

    await pool.query(
      "INSERT INTO ordenes_historial (orden_id, estado_id, usuario_id, comentario) VALUES (?, ?, ?, ?)",
      [result.insertId, estadoFinalId, req.user?.id || null, "Creacion de orden"]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const updateOrden = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  const {
    codigo,
    cliente_id,
    equipo_id,
    tecnico_id,
    grupo_id,
    estado_id,
    fecha_recepcion,
    fecha_entrega_estimada,
    fecha_entrega_real,
    falla_reportada,
    diagnostico,
    observaciones,
    costo_estimado,
    costo_final,
    saldo,
    pagado,
    garantia_dias,
  } = req.body || {};

  if (!codigo || !cliente_id || !equipo_id || !estado_id || !falla_reportada) {
    return badRequest(res, "codigo, cliente_id, equipo_id, estado_id y falla_reportada son requeridos");
  }

  try {
    const [[actual]] = await pool.query("SELECT estado_id FROM ordenes_servicio WHERE id = ? LIMIT 1", [id]);
    if (!actual) return res.status(404).json({ error: "orden no encontrada" });
    const estadoAnterior = actual.estado_id;
    const saldoFinal = saldo !== undefined ? saldo : costo_final !== undefined ? costo_final : null;
    const pagadoFinal = pagado !== undefined ? (pagado ? 1 : 0) : null;
    const [result] = await pool.query(
      `UPDATE ordenes_servicio SET
        codigo = ?, cliente_id = ?, equipo_id = ?, tecnico_id = ?, estado_id = ?,
        fecha_recepcion = ?, fecha_entrega_estimada = ?, fecha_entrega_real = ?,
        falla_reportada = ?, diagnostico = ?, observaciones = ?, costo_estimado = ?,
        costo_final = ?, saldo = COALESCE(?, saldo), pagado = COALESCE(?, pagado), garantia_dias = ?,
        grupo_id = COALESCE(?, grupo_id)
       WHERE id = ?`,
      [
        codigo,
        cliente_id,
        equipo_id,
        tecnico_id || null,
        estado_id,
        fecha_recepcion || new Date(),
        fecha_entrega_estimada || null,
        fecha_entrega_real || null,
        falla_reportada,
        diagnostico || null,
        observaciones || null,
        costo_estimado || null,
        costo_final || null,
        saldoFinal,
        pagadoFinal,
        garantia_dias || null,
        grupo_id || null,
        id,
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "orden no encontrada" });
    if (estadoAnterior !== estado_id) {
      await pool.query(
        "INSERT INTO ordenes_historial (orden_id, estado_id, usuario_id, comentario) VALUES (?, ?, ?, ?)",
        [id, estado_id, req.user?.id || null, "Actualizacion de orden"]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const updateOrdenEstado = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  const { estado_id, comentario } = req.body || {};
  if (!estado_id) return badRequest(res, "estado_id es requerido");
  try {
    const [result] = await pool.query("UPDATE ordenes_servicio SET estado_id = ? WHERE id = ?", [
      estado_id,
      id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "orden no encontrada" });
    await pool.query(
      "INSERT INTO ordenes_historial (orden_id, estado_id, usuario_id, comentario) VALUES (?, ?, ?, ?)",
      [id, estado_id, req.user?.id || null, comentario || null]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const assignOrden = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  const { grupo_id, tecnico_id } = req.body || {};
  if (!grupo_id && !tecnico_id) return badRequest(res, "grupo_id o tecnico_id es requerido");
  try {
    const [result] = await pool.query(
      "UPDATE ordenes_servicio SET grupo_id = COALESCE(?, grupo_id), tecnico_id = COALESCE(?, tecnico_id) WHERE id = ?",
      [grupo_id || null, tecnico_id || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "orden no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const getSugerencias = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [[orden]] = await pool.query(
      "SELECT falla_reportada, diagnostico, observaciones FROM ordenes_servicio WHERE id = ? LIMIT 1",
      [id]
    );
    if (!orden) return res.status(404).json({ error: "orden no encontrada" });

    const texto = `${orden.falla_reportada || ""} ${orden.diagnostico || ""} ${orden.observaciones || ""}`.trim();
    if (!texto) return res.json({ texto: "", sugerencias: [] });

    const [reglas] = await pool.query(
      `SELECT r.id, r.palabras_clave, r.grupo_id, g.nombre AS grupo_nombre,
              r.tecnico_id, t.nombre AS tecnico_nombre, t.apellido AS tecnico_apellido,
              r.prioridad
       FROM reglas_asignacion r
       JOIN grupos_responsables g ON g.id = r.grupo_id
       LEFT JOIN tecnicos t ON t.id = r.tecnico_id
       WHERE r.activo = 1
       ORDER BY r.prioridad DESC, r.id DESC`
    );

    const textoNorm = normalizeText(texto);
    const sugerencias = [];
    for (const regla of reglas) {
      const keywords = String(regla.palabras_clave || "")
        .split(",")
        .map((k) => normalizeText(k))
        .filter(Boolean);
      if (keywords.some((k) => textoNorm.includes(k))) {
        sugerencias.push({ ...regla, match: true });
      }
    }

    res.json({ texto, sugerencias });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const assignSugerido = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [[orden]] = await pool.query(
      "SELECT falla_reportada, diagnostico, observaciones FROM ordenes_servicio WHERE id = ? LIMIT 1",
      [id]
    );
    if (!orden) return res.status(404).json({ error: "orden no encontrada" });
    const texto = `${orden.falla_reportada || ""} ${orden.diagnostico || ""} ${orden.observaciones || ""}`.trim();
    if (!texto) return badRequest(res, "texto insuficiente para sugerir");

    const [reglas] = await pool.query(
      `SELECT r.grupo_id, r.tecnico_id, r.palabras_clave, r.prioridad
       FROM reglas_asignacion r
       WHERE r.activo = 1
       ORDER BY r.prioridad DESC, r.id DESC`
    );
    const textoNorm = normalizeText(texto);
    let regla = null;
    for (const r of reglas) {
      const keywords = String(r.palabras_clave || "")
        .split(",")
        .map((k) => normalizeText(k))
        .filter(Boolean);
      if (keywords.some((k) => textoNorm.includes(k))) {
        regla = r;
        break;
      }
    }
    if (!regla) return res.status(404).json({ error: "sin sugerencias" });

    await pool.query(
      "UPDATE ordenes_servicio SET grupo_id = COALESCE(?, grupo_id), tecnico_id = COALESCE(?, tecnico_id) WHERE id = ?",
      [regla.grupo_id || null, regla.tecnico_id || null, id]
    );

    res.json({ ok: true, grupo_id: regla.grupo_id || null, tecnico_id: regla.tecnico_id || null });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const listMisOrdenes = async (req, res) => {
  const clienteId = req.user?.cliente_id;
  if (!clienteId) return res.status(403).json({ error: "cliente no asociado" });
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.codigo, o.fecha_recepcion, o.fecha_entrega_estimada, o.fecha_entrega_real,
              o.falla_reportada, o.diagnostico, o.observaciones, o.costo_estimado, o.costo_final,
              o.saldo, o.pagado, o.garantia_dias, o.estado_id, s.nombre AS estado_nombre,
              o.equipo_id, e.marca, e.modelo, e.serie
       FROM ordenes_servicio o
       JOIN equipos e ON e.id = o.equipo_id
       JOIN estados_orden s ON s.id = o.estado_id
       WHERE o.cliente_id = ?
       ORDER BY o.id DESC`,
      [clienteId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const getMisOrden = async (req, res) => {
  const clienteId = req.user?.cliente_id;
  const id = asInt(req.params.id);
  if (!clienteId) return res.status(403).json({ error: "cliente no asociado" });
  if (!id) return badRequest(res, "id invalido");
  try {
    const [[orden]] = await pool.query(
      `SELECT o.id, o.codigo, o.fecha_recepcion, o.fecha_entrega_estimada, o.fecha_entrega_real,
              o.falla_reportada, o.diagnostico, o.observaciones, o.costo_estimado, o.costo_final,
              o.saldo, o.pagado, o.garantia_dias, o.estado_id, s.nombre AS estado_nombre,
              o.equipo_id, e.marca, e.modelo, e.serie
       FROM ordenes_servicio o
       JOIN equipos e ON e.id = o.equipo_id
       JOIN estados_orden s ON s.id = o.estado_id
       WHERE o.id = ? AND o.cliente_id = ?
       LIMIT 1`,
      [id, clienteId]
    );
    if (!orden) return res.status(404).json({ error: "orden no encontrada" });

    const [historial] = await pool.query(
      `SELECT h.id, h.estado_id, s.nombre AS estado_nombre, h.comentario, h.fecha
       FROM ordenes_historial h
       JOIN estados_orden s ON s.id = h.estado_id
       WHERE h.orden_id = ?
       ORDER BY h.fecha ASC`,
      [id]
    );

    res.json({ orden, historial });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const createPago = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  const { metodo, valor, referencia } = req.body || {};
  if (!metodo || !valor) return badRequest(res, "metodo y valor son requeridos");

  try {
    const [[orden]] = await pool.query(
      `SELECT o.id, o.cliente_id, o.costo_final, o.pagado, s.nombre AS estado_nombre
       FROM ordenes_servicio o
       JOIN estados_orden s ON s.id = o.estado_id
       WHERE o.id = ? LIMIT 1`,
      [id]
    );
    if (!orden) return res.status(404).json({ error: "orden no encontrada" });

    if (req.user.rol === "Cliente") {
      if (!req.user.cliente_id || req.user.cliente_id !== orden.cliente_id) {
        return res.status(403).json({ error: "sin permisos" });
      }
      if (orden.estado_nombre !== "Listo") {
        return res.status(400).json({ error: "orden no disponible para pago" });
      }
    }

    if (!orden.costo_final) {
      return res.status(400).json({ error: "costo_final no definido" });
    }

    await pool.query(
      "INSERT INTO pagos (orden_id, cliente_id, usuario_id, metodo, valor, referencia) VALUES (?, ?, ?, ?, ?, ?)",
      [id, orden.cliente_id, req.user?.id || null, metodo, valor, referencia || null]
    );

    const [[sumRow]] = await pool.query(
      "SELECT COALESCE(SUM(valor), 0) AS total_pagado FROM pagos WHERE orden_id = ?",
      [id]
    );
    const totalPagado = Number(sumRow.total_pagado || 0);
    const saldo = Math.max(Number(orden.costo_final) - totalPagado, 0);
    const pagado = saldo <= 0 ? 1 : 0;

    await pool.query("UPDATE ordenes_servicio SET saldo = ?, pagado = ? WHERE id = ?", [
      saldo,
      pagado,
      id,
    ]);

    res.status(201).json({ ok: true, total_pagado: totalPagado, saldo, pagado });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const listPagos = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [[orden]] = await pool.query("SELECT id, cliente_id FROM ordenes_servicio WHERE id = ? LIMIT 1", [id]);
    if (!orden) return res.status(404).json({ error: "orden no encontrada" });

    if (req.user.rol === "Cliente") {
      if (!req.user.cliente_id || req.user.cliente_id !== orden.cliente_id) {
        return res.status(403).json({ error: "sin permisos" });
      }
    }

    const [rows] = await pool.query(
      "SELECT id, metodo, valor, referencia, fecha FROM pagos WHERE orden_id = ? ORDER BY fecha DESC",
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const listPagosAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.orden_id, p.metodo, p.valor, p.referencia, p.fecha,
              c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
              u.nombre AS usuario_nombre, u.apellido AS usuario_apellido
       FROM pagos p
       JOIN clientes c ON c.id = p.cliente_id
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       ORDER BY p.fecha DESC
       LIMIT 300`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const deleteOrden = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [[pagos]] = await pool.query("SELECT COUNT(*) AS total FROM pagos WHERE orden_id = ?", [id]);
    if (Number(pagos?.total || 0) > 0) {
      return res.status(400).json({ error: "orden tiene pagos registrados" });
    }
    const [result] = await pool.query("DELETE FROM ordenes_servicio WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "orden no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
