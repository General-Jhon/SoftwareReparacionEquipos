import { pool } from "../db.js";
import { badRequest } from "../utils/http.js";
import { normalizeText } from "../utils/text.js";

const asInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

const toMysqlDateTime = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
};

const toPdfSafeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");

const buildInvoicePdf = ({ orden, pagos, totalPagado, fechaFactura, numeroFactura }) => {
  const ops = [];
  const text = (x, y, value, size = 10, font = "F1") =>
    `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${toPdfSafeText(value)}) Tj ET\n`;
  const strokeRect = (x, y, w, h) => `${x} ${y} ${w} ${h} re S\n`;

  ops.push("0.12 0.16 0.28 rg\n");
  ops.push("30 772 535 42 re f\n");
  ops.push("1 1 1 rg\n");
  ops.push(text(42, 796, "FACTURA DE SERVICIO", 16, "F2"));
  ops.push(text(42, 780, "RepairEquipment", 11, "F1"));

  ops.push("0 0 0 rg\n");
  ops.push(text(375, 796, `No: ${numeroFactura}`, 10, "F2"));
  ops.push(text(375, 782, `Emision: ${fechaFactura}`, 9, "F1"));

  ops.push("0.75 0.75 0.75 RG\n");
  ops.push(strokeRect(30, 660, 535, 95));
  ops.push(strokeRect(30, 560, 535, 88));
  ops.push(strokeRect(30, 490, 535, 58));
  ops.push(strokeRect(30, 280, 535, 198));

  ops.push(text(42, 742, "CLIENTE", 11, "F2"));
  ops.push(text(42, 724, `${orden.cliente_nombre} ${orden.cliente_apellido}`, 10));
  ops.push(text(42, 708, `Documento: ${orden.cliente_documento || "-"}`, 10));
  ops.push(text(42, 692, `Email: ${orden.cliente_email || "-"}`, 10));
  ops.push(text(42, 676, `Telefono: ${orden.cliente_telefono || "-"}`, 10));

  ops.push(text(42, 632, "EQUIPO", 11, "F2"));
  ops.push(text(42, 614, `${orden.marca} ${orden.modelo || ""}`.trim(), 10));
  ops.push(text(42, 598, `Serie: ${orden.serie}`, 10));
  ops.push(text(42, 582, `Estado final: ${orden.estado_nombre}`, 10));
  ops.push(text(42, 566, `Codigo orden: ${orden.codigo}`, 10));

  ops.push(text(42, 534, "RESUMEN ECONOMICO", 11, "F2"));
  ops.push(text(42, 516, `Costo final: $${Number(orden.costo_final || 0).toLocaleString("es-CO")}`, 10));
  ops.push(text(250, 516, `Total pagado: $${Number(totalPagado || 0).toLocaleString("es-CO")}`, 10));
  ops.push(text(470, 516, `Saldo: $${Number(orden.saldo || 0).toLocaleString("es-CO")}`, 10, "F2"));

  ops.push(text(42, 462, "PAGOS REGISTRADOS", 11, "F2"));
  ops.push("0.92 0.92 0.92 rg\n");
  ops.push("40 435 515 20 re f\n");
  ops.push("0 0 0 rg\n");
  ops.push(text(46, 441, "Metodo", 9, "F2"));
  ops.push(text(160, 441, "Valor", 9, "F2"));
  ops.push(text(255, 441, "Referencia", 9, "F2"));
  ops.push(text(425, 441, "Fecha", 9, "F2"));

  const rows = (pagos || []).slice(0, 10);
  if (rows.length === 0) {
    ops.push(text(46, 420, "Sin pagos registrados", 10));
  } else {
    rows.forEach((p, idx) => {
      const y = 420 - idx * 16;
      ops.push(text(46, y, p.metodo || "-", 9));
      ops.push(text(160, y, `$${Number(p.valor || 0).toLocaleString("es-CO")}`, 9));
      ops.push(text(255, y, p.referencia || "-", 9));
      ops.push(text(425, y, new Date(p.fecha).toLocaleString("es-CO"), 9));
    });
  }

  ops.push(text(30, 36, "Documento generado automaticamente por RepairEquipment.", 8));

  const content = ops.join("");

  const contentLen = Buffer.byteLength(content, "utf8");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
    `6 0 obj\n<< /Length ${contentLen} >>\nstream\n${content}endstream\nendobj\n`,
  ];

  const chunks = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary")];
  const offsets = [0];
  let currentOffset = chunks[0].length;

  objects.forEach((obj) => {
    offsets.push(currentOffset);
    const buf = Buffer.from(obj, "utf8");
    chunks.push(buf);
    currentOffset += buf.length;
  });

  const xrefOffset = currentOffset;
  let xref = "xref\n0 7\n0000000000 65535 f \n";
  for (let i = 1; i <= 6; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(Buffer.from(xref + trailer, "utf8"));
  return Buffer.concat(chunks);
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
    const [[actual]] = await pool.query(
      "SELECT estado_id, fecha_recepcion FROM ordenes_servicio WHERE id = ? LIMIT 1",
      [id]
    );
    if (!actual) return res.status(404).json({ error: "orden no encontrada" });
    const estadoAnterior = actual.estado_id;
    const saldoFinal = saldo !== undefined ? saldo : costo_final !== undefined ? costo_final : null;
    const pagadoFinal = pagado !== undefined ? (pagado ? 1 : 0) : null;
    const fechaRecepcionFinal =
      toMysqlDateTime(fecha_recepcion) || toMysqlDateTime(actual.fecha_recepcion) || toMysqlDateTime(new Date());
    const fechaEntregaEstimadaFinal = toMysqlDateTime(fecha_entrega_estimada);
    const fechaEntregaRealFinal = toMysqlDateTime(fecha_entrega_real);
    const [result] = await pool.query(
      `UPDATE ordenes_servicio SET
        codigo = ?, cliente_id = ?, equipo_id = ?, tecnico_id = ?, estado_id = ?,
        fecha_recepcion = ?, fecha_entrega_estimada = COALESCE(?, fecha_entrega_estimada), fecha_entrega_real = COALESCE(?, fecha_entrega_real),
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
        fechaRecepcionFinal,
        fechaEntregaEstimadaFinal,
        fechaEntregaRealFinal,
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
              o.equipo_id, e.marca, e.modelo, e.serie,
              o.tecnico_id, t.nombre AS tecnico_nombre, t.apellido AS tecnico_apellido,
              o.grupo_id, g.nombre AS grupo_nombre
       FROM ordenes_servicio o
       JOIN equipos e ON e.id = o.equipo_id
       JOIN estados_orden s ON s.id = o.estado_id
       LEFT JOIN tecnicos t ON t.id = o.tecnico_id
       LEFT JOIN grupos_responsables g ON g.id = o.grupo_id
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
              o.equipo_id, e.marca, e.modelo, e.serie,
              o.tecnico_id, t.nombre AS tecnico_nombre, t.apellido AS tecnico_apellido,
              o.grupo_id, g.nombre AS grupo_nombre
       FROM ordenes_servicio o
       JOIN equipos e ON e.id = o.equipo_id
       JOIN estados_orden s ON s.id = o.estado_id
       LEFT JOIN tecnicos t ON t.id = o.tecnico_id
       LEFT JOIN grupos_responsables g ON g.id = o.grupo_id
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

    const [pagos] = await pool.query(
      "SELECT id, metodo, valor, referencia, fecha FROM pagos WHERE orden_id = ? ORDER BY fecha DESC",
      [id]
    );

    res.json({ orden, historial, pagos });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const getMiFactura = async (req, res) => {
  const clienteId = req.user?.cliente_id;
  const id = asInt(req.params.id);
  if (!clienteId) return res.status(403).json({ error: "cliente no asociado" });
  if (!id) return badRequest(res, "id invalido");
  try {
    const [[orden]] = await pool.query(
      `SELECT o.id, o.codigo, o.fecha_recepcion, o.fecha_entrega_real, o.costo_final, o.saldo, o.pagado,
              s.nombre AS estado_nombre, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
              c.documento AS cliente_documento, c.email AS cliente_email, c.telefono AS cliente_telefono,
              e.marca, e.modelo, e.serie
       FROM ordenes_servicio o
       JOIN clientes c ON c.id = o.cliente_id
       JOIN equipos e ON e.id = o.equipo_id
       JOIN estados_orden s ON s.id = o.estado_id
       WHERE o.id = ? AND o.cliente_id = ?
       LIMIT 1`,
      [id, clienteId]
    );
    if (!orden) return res.status(404).json({ error: "orden no encontrada" });
    if (!orden.pagado) {
      return res.status(400).json({ error: "la factura se habilita cuando la orden este pagada" });
    }

    const [pagos] = await pool.query(
      "SELECT metodo, valor, referencia, fecha FROM pagos WHERE orden_id = ? ORDER BY fecha ASC",
      [id]
    );

    const totalPagado = pagos.reduce((acc, p) => acc + Number(p.valor || 0), 0);
    const fechaFactura = new Date().toLocaleString("es-CO");
    const numeroFactura = `FAC-${String(orden.codigo || "").replace(/\s+/g, "-")}`;
    const pdfBuffer = buildInvoicePdf({
      orden,
      pagos,
      totalPagado,
      fechaFactura,
      numeroFactura,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"factura_${orden.codigo}.pdf\"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};

export const getFacturaOrden = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return badRequest(res, "id invalido");
  try {
    const [[orden]] = await pool.query(
      `SELECT o.id, o.codigo, o.fecha_recepcion, o.fecha_entrega_real, o.costo_final, o.saldo, o.pagado,
              s.nombre AS estado_nombre, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
              c.documento AS cliente_documento, c.email AS cliente_email, c.telefono AS cliente_telefono,
              e.marca, e.modelo, e.serie
       FROM ordenes_servicio o
       JOIN clientes c ON c.id = o.cliente_id
       JOIN equipos e ON e.id = o.equipo_id
       JOIN estados_orden s ON s.id = o.estado_id
       WHERE o.id = ?
       LIMIT 1`,
      [id]
    );
    if (!orden) return res.status(404).json({ error: "orden no encontrada" });
    if (!orden.pagado) {
      return res.status(400).json({ error: "la factura se habilita cuando la orden este pagada" });
    }

    const [pagos] = await pool.query(
      "SELECT metodo, valor, referencia, fecha FROM pagos WHERE orden_id = ? ORDER BY fecha ASC",
      [id]
    );

    const totalPagado = pagos.reduce((acc, p) => acc + Number(p.valor || 0), 0);
    const fechaFactura = new Date().toLocaleString("es-CO");
    const numeroFactura = `FAC-${String(orden.codigo || "").replace(/\s+/g, "-")}`;
    const pdfBuffer = buildInvoicePdf({
      orden,
      pagos,
      totalPagado,
      fechaFactura,
      numeroFactura,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"factura_${orden.codigo}.pdf\"`);
    res.send(pdfBuffer);
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
    }

    if (!["Listo", "Entregado"].includes(String(orden.estado_nombre || ""))) {
      return res.status(400).json({ error: "orden no disponible para pago" });
    }

    if (!orden.costo_final) {
      return res.status(400).json({ error: "costo_final no definido" });
    }

    if (orden.pagado) {
      return res.status(400).json({ error: "orden ya pagada" });
    }

    const [[sumRowBefore]] = await pool.query(
      "SELECT COALESCE(SUM(valor), 0) AS total_pagado FROM pagos WHERE orden_id = ?",
      [id]
    );
    const totalPagadoPrevio = Number(sumRowBefore.total_pagado || 0);
    const saldoPrevio = Math.max(Number(orden.costo_final) - totalPagadoPrevio, 0);
    const valorNum = Number(valor);
    if (valorNum <= 0) return badRequest(res, "valor invalido");
    if (valorNum > saldoPrevio) {
      return res.status(400).json({ error: "el valor supera el saldo pendiente" });
    }

    await pool.query(
      "INSERT INTO pagos (orden_id, cliente_id, usuario_id, metodo, valor, referencia) VALUES (?, ?, ?, ?, ?, ?)",
      [id, orden.cliente_id, req.user?.id || null, metodo, valorNum, referencia || null]
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
