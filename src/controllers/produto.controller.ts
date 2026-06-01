import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client";
import { AppError } from "../middlewares/errorHandler";

export class ProdutoController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const busca =
        typeof req.query.busca === "string"
          ? req.query.busca.trim()
          : undefined;
      const categoriaId =
        typeof req.query.categoriaId === "string"
          ? req.query.categoriaId
          : undefined;
      const apenasAlerta = req.query.apenasAlerta === "true";

      const produtos = await prisma.produto.findMany({
        where: {
          ...(busca ? { nome: { contains: busca } } : {}),
          ...(categoriaId ? { categoriaId } : {}),
        },
        include: { categoria: true },
        orderBy: { nome: "asc" },
      });

      const resultado = apenasAlerta
        ? produtos.filter(
            (produto) => produto.quantidade < produto.quantidadeMinima,
          )
        : produtos;

      res.json(resultado);
    } catch (error) {
      next(error as Error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const produto = await prisma.produto.findUnique({
        where: { id },
        include: { categoria: true },
      });

      if (!produto) {
        throw new AppError("Produto não encontrado", 404);
      }

      res.json(produto);
    } catch (error) {
      next(error as Error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        nome,
        categoriaId,
        quantidade,
        quantidadeMinima,
        preco,
        unidade,
        observacao,
        foto,
      } = req.body;

      if (!nome || !categoriaId || preco === undefined) {
        throw new AppError(
          "Campos obrigatórios: nome, categoriaId, preco",
          400,
        );
      }

      const categoriaExiste = await prisma.categoria.findUnique({
        where: { id: String(categoriaId) },
      });

      if (!categoriaExiste) {
        throw new AppError("Categoria não encontrada", 404);
      }

      const produto = await prisma.produto.create({
        data: {
          nome: String(nome).trim(),
          categoriaId: String(categoriaId),
          quantidade: Number(quantidade ?? 0),
          quantidadeMinima: Number(quantidadeMinima ?? 0),
          preco: Number(preco),
          unidade: String(unidade ?? "un"),
          observacao: observacao ? String(observacao) : null,
          foto: foto ? String(foto) : null,
        },
        include: { categoria: true },
      });

      res.status(201).json(produto);
    } catch (error) {
      next(error as Error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const {
        nome,
        categoriaId,
        quantidade,
        quantidadeMinima,
        preco,
        unidade,
        observacao,
        foto,
      } = req.body;

      const produtoExiste = await prisma.produto.findUnique({ where: { id } });
      if (!produtoExiste) {
        throw new AppError("Produto não encontrado", 404);
      }

      if (categoriaId !== undefined) {
        const categoriaExiste = await prisma.categoria.findUnique({
          where: { id: String(categoriaId) },
        });

        if (!categoriaExiste) {
          throw new AppError("Categoria não encontrada", 404);
        }
      }

      const produto = await prisma.produto.update({
        where: { id },
        data: {
          ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
          ...(categoriaId !== undefined
            ? { categoriaId: String(categoriaId) }
            : {}),
          ...(quantidade !== undefined
            ? { quantidade: Number(quantidade) }
            : {}),
          ...(quantidadeMinima !== undefined
            ? { quantidadeMinima: Number(quantidadeMinima) }
            : {}),
          ...(preco !== undefined ? { preco: Number(preco) } : {}),
          ...(unidade !== undefined ? { unidade: String(unidade) } : {}),
          ...(observacao !== undefined
            ? { observacao: observacao ? String(observacao) : null }
            : {}),
          ...(foto !== undefined ? { foto: foto ? String(foto) : null } : {}),
          ultimaMovimentacao: new Date(),
        },
        include: { categoria: true },
      });

      res.json(produto);
    } catch (error) {
      next(error as Error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const produtoExiste = await prisma.produto.findUnique({ where: { id } });
      if (!produtoExiste) {
        throw new AppError("Produto não encontrado", 404);
      }

      await prisma.produto.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      next(error as Error);
    }
  }
}
