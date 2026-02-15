import express from "express";

import { authRequired, requireRole } from "../middleware/auth.js";
import {
  listReglas,
  createRegla,
  updateRegla,
  deleteRegla,
} from "../controllers/reglas.controller.js";

const router = express.Router();
router.get("/reglas-asignacion", authRequired, requireRole("Administrador"), listReglas);
router.post("/reglas-asignacion", authRequired, requireRole("Administrador"), createRegla);
router.put("/reglas-asignacion/:id", authRequired, requireRole("Administrador"), updateRegla);
router.delete("/reglas-asignacion/:id", authRequired, requireRole("Administrador"), deleteRegla);

export default router;
