import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export type AuthenticatedRequest = Request & {
  userId: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  (req as AuthenticatedRequest).userId = userId;
  next();
}

export function getAuthenticatedUserId(req: Request) {
  return (req as AuthenticatedRequest).userId;
}