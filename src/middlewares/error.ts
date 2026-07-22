import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message });
  }
  if (err instanceof ZodError) {
    return res
      .status(422)
      .json({ erro: "Dados inválidos", detalhes: err.flatten().fieldErrors });
  }
  console.error(err);
  return res.status(500).json({ erro: "Erro interno do servidor" });
}
