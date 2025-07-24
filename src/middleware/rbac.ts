import { Request, Response, NextFunction } from "express";
import {ApiError} from "../utils/ApiErrors";
import { asyncHandler } from "../utils/asyncHandler";
import { container } from "tsyringe";
import { RbacService } from "../services/Rbac.service";
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
        throw new ApiError(403, err); // err = "Access denied" ya "Document not found"
      }
    });
  });
};
