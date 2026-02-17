import express from "express";

import { authRequired, requireRole } from "../middleware/auth.js";
import {
  listUsuarios,
  listRoles,
  createUsuario,
  updateUsuario,
  resetUsuarioPassword,
  deleteUsuario,
} from "../controllers/usuarios.controller.js";

const router = express.Router();

router.get("/usuarios", authRequired, requireRole("Administrador"), listUsuarios);
router.get("/usuarios/roles", authRequired, requireRole("Administrador"), listRoles);
router.post("/usuarios", authRequired, requireRole("Administrador"), createUsuario);
router.put("/usuarios/:id", authRequired, requireRole("Administrador"), updateUsuario);
router.put("/usuarios/:id/password", authRequired, requireRole("Administrador"), resetUsuarioPassword);
router.delete("/usuarios/:id", authRequired, requireRole("Administrador"), deleteUsuario);

export default router;
