import { Router } from "express";
import { CategoriaController } from "../controllers/categoria.controller";

const router = Router();
const controller = new CategoriaController();

router.get("/", controller.listar.bind(controller));
router.get("/:id", controller.buscarPorId.bind(controller));
router.post("/", controller.criar.bind(controller));
router.put("/:id", controller.atualizar.bind(controller));
router.delete("/:id", controller.deletar.bind(controller));

export { router as categoriaRouter };
