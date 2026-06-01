import { Router } from "express";
import { categoriaRouter } from "./categoria.routes";
import { produtoRouter } from "./produto.routes";
import { authRouter } from "./auth.routes";

const router = Router();

// Rotas públicas
router.use("/auth", authRouter);

// Rotas privadas
router.use("/produtos", produtoRouter);
router.use("/categorias", categoriaRouter);

export { router };
