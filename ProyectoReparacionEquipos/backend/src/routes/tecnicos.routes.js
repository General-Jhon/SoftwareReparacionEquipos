import express from "express";

import { authRequired, requireAnyRole, requireRole } from "../middleware/auth.js";
import { listTecnicos, createTecnico, updateTecnico, deleteTecnico } from "../controllers/tecnicos.controller.js";

const router = express.Router();

router.get("/tecnicos", authRequired, requireAnyRole(["Administrador", "Tecnico", "Recepcion"]), listTecnicos);
router.post("/tecnicos", authRequired, requireRole("Administrador"), createTecnico);
router.put("/tecnicos/:id", authRequired, requireRole("Administrador"), updateTecnico);
router.delete("/tecnicos/:id", authRequired, requireRole("Administrador"), deleteTecnico);

export default router;
