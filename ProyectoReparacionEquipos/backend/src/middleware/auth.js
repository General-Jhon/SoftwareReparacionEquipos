import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "change_me_please";

export const authRequired = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "token requerido" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "token invalido" });
  }
};

export const requireRole = (roleName) => (req, res, next) => {
  if (!req.user || req.user.rol !== roleName) {
    return res.status(403).json({ error: "sin permisos" });
  }
  return next();
};

export const requireAnyRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return res.status(403).json({ error: "sin permisos" });
  }
  return next();
};
