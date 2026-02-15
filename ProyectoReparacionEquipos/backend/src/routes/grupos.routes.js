import express from "express";

import { authRequired, requireRole } from "../middleware/auth.js";
import {
  listGrupos,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  addTecnicoToGrupo,
  removeTecnicoFromGrupo,
  listTecnicosByGrupo,
} from "../controllers/grupos.controller.js";

const router = express.Router();

router.get("/grupos", authRequired, listGrupos);

router.post("/grupos", authRequired, requireRole("Administrador"), createGrupo);

router.put("/grupos/:id", authRequired, requireRole("Administrador"), updateGrupo);

router.delete("/grupos/:id", authRequired, requireRole("Administrador"), deleteGrupo);

router.post("/tecnicos/:id/grupos", authRequired, requireRole("Administrador"), addTecnicoToGrupo);

router.delete(
  "/tecnicos/:id/grupos/:grupoId",
  authRequired,
  requireRole("Administrador"),
  removeTecnicoFromGrupo
);

router.get("/grupos/:id/tecnicos", authRequired, listTecnicosByGrupo);

export default router;
