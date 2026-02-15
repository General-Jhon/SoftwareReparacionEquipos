import express from "express";

import { authRequired, requireAnyRole, requireRole } from "../middleware/auth.js";
import {
  listEquipos,
  getEquipo,
  createEquipo,
  updateEquipo,
  deleteEquipo,
} from "../controllers/equipos.controller.js";

const router = express.Router();

router.get(
  "/equipos",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  listEquipos
);

router.get(
  "/equipos/:id",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  getEquipo
);

router.post(
  "/equipos",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  createEquipo
);

router.put(
  "/equipos/:id",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  updateEquipo
);

router.delete("/equipos/:id", authRequired, requireRole("Administrador"), deleteEquipo);

export default router;
