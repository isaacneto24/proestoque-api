import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const z = error as ZodError;
        const erros = z.issues.map((e: any) => ({
          campo: e.path.join("."),
          mensagem: e.message,
        }));
        res.status(422).json({ erro: "Dados inválidos", detalhes: erros });
        return;
      }
      next(error);
    }
  };
}
