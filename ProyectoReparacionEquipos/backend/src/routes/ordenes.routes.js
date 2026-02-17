import express from "express";

import { authRequired, requireAnyRole, requireRole } from "../middleware/auth.js";
import {
  listOrdenes,
  getOrden,
  createOrden,
  updateOrden,
  updateOrdenEstado,
  assignOrden,
  getSugerencias,
  assignSugerido,
  listMisOrdenes,
  getMisOrden,
  getMiFactura,
  getFacturaOrden,
  createPago,
  listPagos,
  listPagosAdmin,
  deleteOrden,
} from "../controllers/ordenes.controller.js";

const router = express.Router();

router.get(
  "/ordenes",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  listOrdenes
);

router.get(
  "/ordenes/:id",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  getOrden
);

router.post(
  "/ordenes",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  createOrden
);

router.put(
  "/ordenes/:id",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  updateOrden
);

router.patch(
  "/ordenes/:id/estado",
  authRequired,
  requireAnyRole(["Administrador", "Tecnico", "Recepcion"]),
  updateOrdenEstado
);
router.delete("/ordenes/:id", authRequired, requireRole("Administrador"), deleteOrden);

router.post("/ordenes/:id/asignar", authRequired, requireRole("Administrador"), assignOrden);

router.get("/ordenes/:id/sugerencias", authRequired, requireRole("Administrador"), getSugerencias);

router.post("/ordenes/:id/asignar-sugerido", authRequired, requireRole("Administrador"), assignSugerido);

router.get("/mis-ordenes", authRequired, requireRole("Cliente"), listMisOrdenes);

router.get("/mis-ordenes/:id", authRequired, requireRole("Cliente"), getMisOrden);
router.get("/mis-ordenes/:id/factura", authRequired, requireRole("Cliente"), getMiFactura);
router.get(
  "/ordenes/:id/factura",
  authRequired,
  requireAnyRole(["Administrador", "Recepcion"]),
  getFacturaOrden
);

router.post("/ordenes/:id/pagos", authRequired, createPago);

router.get("/ordenes/:id/pagos", authRequired, listPagos);
router.get("/pagos", authRequired, requireAnyRole(["Administrador", "Recepcion"]), listPagosAdmin);

export default router;
