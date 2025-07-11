import ApiError from '../utils/ApiErrors';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../schema/user.schema';
import {eq} from "drizzle-orm";
import { asyncHandler } from '../utils/asyncHandler';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

export const verifyJWT = asyncHandler (async (req: Request, res: Response, next: NextFunction) => {
try{
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token ){
        throw new ApiError(401, "Unauthorized access");
    }
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET!)

    const user = await db
    .select()
    .from(User)
    .where(eq(User.id, (decodedToken as any).id))

    if (!user ){
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user  = user[0] ;
    next();
}catch (error) {
    throw new ApiError(401, (error as any)?.message || "Unauthorized access");
  }
})