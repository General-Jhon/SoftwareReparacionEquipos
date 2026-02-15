import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

dotenv.config();

const requiredEnv = [
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "DB_PORT",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_NOMBRE",
  "ADMIN_APELLIDO",
];

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

const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const nombre = process.env.ADMIN_NOMBRE;
  const apellido = process.env.ADMIN_APELLIDO;
  const password = process.env.ADMIN_PASSWORD;

  const [[role]] = await pool.query("SELECT id FROM roles WHERE nombre = 'Administrador' LIMIT 1");
  if (!role) {
    throw new Error("No existe el rol 'Administrador'. Ejecuta primero el schema.sql");
  }

  const [[existing]] = await pool.query("SELECT id FROM usuarios WHERE email = ? LIMIT 1", [email]);
  if (existing) {
    console.log("Admin ya existe. No se hicieron cambios.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO usuarios (rol_id, nombre, apellido, email, password_hash) VALUES (?, ?, ?, ?, ?)",
    [role.id, nombre, apellido, email, passwordHash]
  );

  console.log("Admin creado correctamente.");
};

ensureAdmin()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err.message || err);
    pool.end().finally(() => process.exit(1));
  });
