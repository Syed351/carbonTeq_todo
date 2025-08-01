import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import {ApiError} from "../utils/ApiErrors";

export const validate = (schema: ZodSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors
    .map(e => `${e.path.join('.')}:${e.message}`).join(",");
    throw new ApiError(400, message);
  }

  req.body = result.data; // ✅ use validated data
  next();
};

export const validateQuery = (schema: ZodSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const message = result.error.errors.map(e => e.message).join(", ");
    throw new ApiError(400, message);
  }
  (req as any).validatedQuery = result.data;
  next();
};
export const validateParams = (schema: ZodSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    const message = result.error.errors.map(e => e.message).join(", ");
    throw new ApiError(400, message);
  }

  req.params = result.data; // ✅ use validated data
  next();
};

