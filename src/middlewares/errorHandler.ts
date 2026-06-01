import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ erro: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ erro: "Conflito de dados no banco" });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({ erro: "Registro não encontrado" });
      return;
    }
  }

  console.error(err);
  res.status(500).json({
    erro:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Erro interno do servidor",
  });
}
