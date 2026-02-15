import express from "express";
import { login, registerCliente } from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/login", login);
router.post("/register-cliente", registerCliente);

export default router;
