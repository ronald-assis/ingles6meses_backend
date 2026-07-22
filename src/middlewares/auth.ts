import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";
import { AppError } from "../lib/errors.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      role?: string;
    }
  }
}

export function auth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Token não fornecido", 401);
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.userId = payload.sub;
    req.role = payload.role;
    next();
  } catch {
    throw new AppError("Token inválido ou expirado", 401);
  }
}
