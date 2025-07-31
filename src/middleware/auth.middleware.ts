import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthService } from "../services/Auth.service"


declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
const authService = container.resolve(AuthService);
export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  const result = await authService.validateToken(token);

  if (result.isOk()) {
    req.user = result.unwrap(); // ✅ safe unwrap
    return next();
  }

  // Error case
  return res.status(401).json({ message: "Unauthorized: " + result.unwrapErr() });
});