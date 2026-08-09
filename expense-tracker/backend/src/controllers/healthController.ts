import { Request, Response } from "express";

export const healthController = {
  getHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: "ok",
      service: "expense-tracker-api",
      timestamp: new Date().toISOString(),
    });
  },
};
