import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../utils/errors";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError());
    return;
  }

  next();
}
