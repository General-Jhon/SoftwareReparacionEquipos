import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import equiposRoutes from "./routes/equipos.routes.js";
import ordenesRoutes from "./routes/ordenes.routes.js";
import gruposRoutes from "./routes/grupos.routes.js";
import reglasRoutes from "./routes/reglas.routes.js";
import tecnicosRoutes from "./routes/tecnicos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, db: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err.message || err) });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api", clientesRoutes);
app.use("/api", equiposRoutes);
app.use("/api", ordenesRoutes);
app.use("/api", gruposRoutes);
app.use("/api", reglasRoutes);
app.use("/api", tecnicosRoutes);
app.use("/api", usuariosRoutes);

export default app;
