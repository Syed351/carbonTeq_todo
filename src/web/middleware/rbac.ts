import { Request, Response, NextFunction } from "express";
import {ApiError} from "../../infrastructure/utils/api.errors";
import { asyncHandler } from "../../infrastructure/utils/asyncHandler";
import { container } from "tsyringe";
import { RbacService } from "../../domain/service/rbac.service";
import { matchRes } from "@carbonteq/fp"

type AllowedPermissionKey = "create" | "read" | "update" | "delete";
const rbacService = container.resolve(RbacService);

export const rbacWithPermissions = (action: AllowedPermissionKey) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const docId = req.params.id;
   console.log("RBAC received user:", req.user);
    console.log("Action:", action);
    
    const result = await rbacService.canAccess(user.id, user.role, docId, action);
    console.log(user.id,user.role, docId, action)

    return matchRes(result, {
      Ok: () => next(),
      Err: (err) => {
        throw new ApiError(403, err); 
      }
    });
  });
};
