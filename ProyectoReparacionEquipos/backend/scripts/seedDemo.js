import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

dotenv.config();

const requiredEnv = ["DB_HOST", "DB_USER", "DB_NAME", "DB_PORT"];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Faltan variables en .env: ${missing.join(", ")}`);
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 5,
});

const seed = async () => {
  const [clientes] = await pool.query("SELECT id FROM clientes LIMIT 1");
  if (clientes.length > 0) {
    console.log("Ya existen datos. Seed demo omitido.");
    return;
  }

  const [resultClientes] = await pool.query(
    `INSERT INTO clientes (nombre, apellido, documento, telefono, email, direccion, ciudad, notas) VALUES
     ('Carlos', 'Gomez', 'CC1001', '3001112222', 'carlos@mail.com', 'Calle 10 #5-20', 'Bogota', 'Cliente frecuente'),
     ('Laura', 'Martinez', 'CC1002', '3003334444', 'laura@mail.com', 'Cra 15 #20-30', 'Bogota', NULL),
     ('Andres', 'Lopez', 'CC1003', '3005556666', 'andres@mail.com', 'Av 7 #80-10', 'Bogota', NULL),
     ('Sofia', 'Perez', 'CC1004', '3007778888', 'sofia@mail.com', 'Calle 50 #12-40', 'Bogota', NULL),
     ('Diego', 'Rojas', 'CC1005', '3009990000', 'diego@mail.com', 'Cra 9 #45-60', 'Bogota', NULL)`
  );

  const firstClienteId = resultClientes.insertId;

  const [tipos] = await pool.query("SELECT id, nombre FROM tipos_equipo");
  const tipoByName = new Map(tipos.map((t) => [t.nombre, t.id]));

  await pool.query(
    `INSERT INTO tecnicos (nombre, apellido, telefono, email, especialidad) VALUES
     ('Juan', 'Torres', '3201112222', 'juan.t@mail.com', 'Portatiles'),
     ('Maria', 'Diaz', '3203334444', 'maria.d@mail.com', 'Impresoras')`
  );

  const [[roleCliente]] = await pool.query("SELECT id FROM roles WHERE nombre = 'Cliente' LIMIT 1");
  if (roleCliente) {
    const passwordHash = await bcrypt.hash("Cliente1234", 10);
    await pool.query(
      "INSERT INTO usuarios (rol_id, cliente_id, nombre, apellido, email, telefono, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [roleCliente.id, firstClienteId, "Carlos", "Gomez", "carlos@mail.com", "3001112222", passwordHash]
    );
  }

  await pool.query(
    `INSERT INTO equipos (cliente_id, tipo_id, marca, modelo, serie, color, accesorios, descripcion) VALUES
     (?, ?, 'HP', 'Pavilion 15', 'SN-HP-001', 'Negro', 'Cargador', 'No enciende'),
     (?, ?, 'Lenovo', 'ThinkPad T480', 'SN-LEN-002', 'Negro', 'Cargador', 'Pantalla con lineas'),
     (?, ?, 'Epson', 'L3150', 'SN-EPS-003', 'Negro', 'Cables', 'No imprime'),
     (?, ?, 'Dell', 'Inspiron 14', 'SN-DLL-004', 'Gris', 'Cargador', 'Bateria dura poco'),
     (?, ?, 'Samsung', 'Galaxy Tab A', 'SN-SAM-005', 'Blanco', 'Cargador', 'No carga')`,
    [
      firstClienteId,
      tipoByName.get("Laptop") || null,
      firstClienteId + 1,
      tipoByName.get("Laptop") || null,
      firstClienteId + 2,
      tipoByName.get("Impresora") || null,
      firstClienteId + 3,
      tipoByName.get("Laptop") || null,
      firstClienteId + 4,
      tipoByName.get("Tablet") || null,
    ]
  );

  const [[estadoRecibido]] = await pool.query("SELECT id FROM estados_orden WHERE nombre = 'Recibido' LIMIT 1");
  const [[estadoDiagnostico]] = await pool.query("SELECT id FROM estados_orden WHERE nombre = 'En Diagnostico' LIMIT 1");
  const [equipos] = await pool.query("SELECT id, cliente_id FROM equipos ORDER BY id ASC LIMIT 5");
  const [tecnicos] = await pool.query("SELECT id FROM tecnicos ORDER BY id ASC LIMIT 2");

  const ordenes = [
    {
      codigo: "OS-0001",
      equipo: equipos[0],
      tecnico_id: tecnicos[0]?.id || null,
      estado_id: estadoRecibido?.id,
      falla_reportada: "No enciende",
      diagnostico: null,
      observaciones: "Se entrega con cargador",
      costo_estimado: 150000,
    },
    {
      codigo: "OS-0002",
      equipo: equipos[1],
      tecnico_id: tecnicos[0]?.id || null,
      estado_id: estadoDiagnostico?.id,
      falla_reportada: "Pantalla con lineas",
      diagnostico: "Posible falla de cable flex",
      observaciones: null,
      costo_estimado: 220000,
    },
    {
      codigo: "OS-0003",
      equipo: equipos[2],
      tecnico_id: tecnicos[1]?.id || null,
      estado_id: estadoRecibido?.id,
      falla_reportada: "No imprime",
      diagnostico: null,
      observaciones: null,
      costo_estimado: 90000,
    },
    {
      codigo: "OS-0004",
      equipo: equipos[3],
      tecnico_id: tecnicos[0]?.id || null,
      estado_id: estadoDiagnostico?.id,
      falla_reportada: "Bateria dura poco",
      diagnostico: "Bateria degradada",
      observaciones: "Sugerir reemplazo",
      costo_estimado: 180000,
    },
    {
      codigo: "OS-0005",
      equipo: equipos[4],
      tecnico_id: tecnicos[1]?.id || null,
      estado_id: estadoRecibido?.id,
      falla_reportada: "No carga",
      diagnostico: null,
      observaciones: null,
      costo_estimado: 120000,
    },
  ];

  for (const o of ordenes) {
    const costoFinal = o.costo_estimado;
    const [result] = await pool.query(
      `INSERT INTO ordenes_servicio
        (codigo, cliente_id, equipo_id, tecnico_id, estado_id, falla_reportada, diagnostico, observaciones,
         costo_estimado, costo_final, saldo, pagado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.codigo,
        o.equipo.cliente_id,
        o.equipo.id,
        o.tecnico_id,
        o.estado_id,
        o.falla_reportada,
        o.diagnostico,
        o.observaciones,
        o.costo_estimado,
        costoFinal,
        costoFinal,
        0,
      ]
    );

    await pool.query(
      "INSERT INTO ordenes_historial (orden_id, estado_id, comentario) VALUES (?, ?, ?)",
      [result.insertId, o.estado_id, "Creacion de orden (seed)"]
    );
  }

  console.log("Seed demo completado.");
};

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err.message || err);
    pool.end().finally(() => process.exit(1));
  });
