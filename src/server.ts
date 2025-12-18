import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRouter from "./routes/products";
import usersRouter from "./routes/users";
import cartRouter from "./routes/cart";

dotenv.config();
const app = express();

app.use(cors({ origin: "https://ecomerce-front-end-ebon.vercel.app/" }));
app.use(express.json());

app.get("/", (_, res) => res.send("🚀 Backend działa!"));
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/cart", cartRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;
