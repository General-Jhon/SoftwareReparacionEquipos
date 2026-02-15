import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
