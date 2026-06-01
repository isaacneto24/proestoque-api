import { NextFunction, Request, Response } from "express";
import { AppError } from "../middlewares/errorHandler";
import { prisma } from "../prisma/client";

export class CategoriaController {
  async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const categorias = await prisma.categoria.findMany({
        orderBy: { nome: "asc" },
        include: {
          _count: { select: { produtos: true } },
        },
      });

      res.json(categorias);
    } catch (error) {
      next(error as Error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const categoria = await prisma.categoria.findUnique({
        where: { id },
        include: { produtos: { orderBy: { nome: "asc" } } },
      });

      if (!categoria) {
        throw new AppError("Categoria não encontrada", 404);
      }

      res.json(categoria);
    } catch (error) {
      next(error as Error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { nome, icone, cor } = req.body;

      if (!nome || !icone || !cor) {
        throw new AppError("Campos obrigatórios: nome, icone, cor", 400);
      }

      const categoria = await prisma.categoria.create({
        data: {
          nome: String(nome).trim(),
          icone: String(icone).trim(),
          cor: String(cor).trim(),
        },
      });

      res.status(201).json(categoria);
    } catch (error) {
      next(error as Error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { nome, icone, cor } = req.body;

      const categoriaExiste = await prisma.categoria.findUnique({
        where: { id },
      });
      if (!categoriaExiste) {
        throw new AppError("Categoria não encontrada", 404);
      }

      const categoria = await prisma.categoria.update({
        where: { id },
        data: {
          ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
          ...(icone !== undefined ? { icone: String(icone).trim() } : {}),
          ...(cor !== undefined ? { cor: String(cor).trim() } : {}),
        },
      });

      res.json(categoria);
    } catch (error) {
      next(error as Error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const categoriaExiste = await prisma.categoria.findUnique({
        where: { id },
      });
      if (!categoriaExiste) {
        throw new AppError("Categoria não encontrada", 404);
      }

      await prisma.categoria.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      next(error as Error);
    }
  }
}
