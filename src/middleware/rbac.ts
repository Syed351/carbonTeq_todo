import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { Documents } from "../schema/document.schema";
import { Roles } from "../schema/roles.schema";
import { Permissions } from "../schema/permission.schema";
import { eq, and } from "drizzle-orm";
import {ApiError} from "../utils/ApiErrors";
import { asyncHandler } from "../utils/asyncHandler";

type AllowedPermissionKey = "create" | "read" | "update" | "delete";

export const rbacWithPermissions = (action: AllowedPermissionKey) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const docId = req.params.id;

    if (docId) {
      const [document] = await db
        .select()
        .from(Documents)
        .where(eq(Documents.id, docId));

      if (!document) throw new ApiError(404, "Document not found");

      const isOwner = document.userId === user.id;
      if (isOwner) return next();
    }

    const [role] = await db
      .select()
      .from(Roles)
      .where(eq(Roles.name, user.role));

    if (!role) throw new ApiError(404, "Role not found");

    const [permission] = await db
      .select()
      .from(Permissions)
      .where(
        and(
          eq(Permissions.roleId, role.id),
          eq(Permissions.action, action)
        )
      );

    if (!permission || !permission.allowed) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();
  });
};
