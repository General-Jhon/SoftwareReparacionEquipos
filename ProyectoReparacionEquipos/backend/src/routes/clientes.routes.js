import express from "express";

import { authRequired, requireAnyRole, requireRole } from "../middleware/auth.js";
import {
  listClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../controllers/clientes.controller.js";

const router = express.Router();

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
