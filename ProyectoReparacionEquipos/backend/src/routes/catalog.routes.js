import express from "express";
import { getEstados, getTiposEquipo } from "../controllers/catalog.controller.js";

const router = express.Router();

router.get("/estados", getEstados);
router.get("/tipos-equipo", getTiposEquipo);

export default router;
