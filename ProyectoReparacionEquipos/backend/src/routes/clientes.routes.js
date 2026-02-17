import express from "express";

import { authRequired, requireAnyRole, requireRole } from "../middleware/auth.js";
import {
  listClientes,
  getCliente,
  getMiPerfilCliente,
  createCliente,
  updateCliente,
  updateMiPerfilCliente,
  deleteCliente,
} from "../controllers/clientes.controller.js";

const router = express.Router();

router.get("/clientes/me", authRequired, requireRole("Cliente"), getMiPerfilCliente);
router.put("/clientes/me", authRequired, requireRole("Cliente"), updateMiPerfilCliente);

router.get(
  "/clientes",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  listClientes
);

router.get(
  "/clientes/:id",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  getCliente
);

router.post(
  "/clientes",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  createCliente
);

router.put(
  "/clientes/:id",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  updateCliente
);

router.delete("/clientes/:id", authRequired, requireRole("Administrador"), deleteCliente);

export default router;
