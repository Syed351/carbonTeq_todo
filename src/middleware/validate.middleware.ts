import { Request,Response,NextFunction } from "express";
import { ZodSchema } from "zod";
import ApiError from "../utils/ApiErrors";

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if(!result.success){
              throw new ApiError(400, "Invalid request data");
        }
        req.body = result.data;
        next();
    };
};  