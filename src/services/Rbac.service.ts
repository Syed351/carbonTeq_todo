// src/services/impl/rbac.service.ts
import { inject, injectable } from "tsyringe";
import { IRbacService } from "../interface/rbacInterface";
import { IDocumentRepository } from "../interface/document.repository";
import { IPermissionRepository } from "../interface/permission.repository";
import { ILogger } from "../interface/logger.interface";
import { Result } from "@carbonteq/fp"
import { TOKENS } from "../token"

@injectable()
export class RbacService implements IRbacService {
  constructor(
    @inject(TOKENS.IDocumentRepository) private documentRepository: IDocumentRepository,
    @inject(TOKENS.IPermissionRepository) private permissionRepository: IPermissionRepository,
    @inject(TOKENS.ILogger) private logger: ILogger

  ) {}

 async canAccess(
  userId: string,
  role: string,
  documentId: string | undefined,
  action: "create" | "read" | "update" | "delete"
): Promise<Result<boolean, string>> {
  
  if (action === "create") {
    const hasPerm = await this.permissionRepository.hasPermission(role, action);
    return hasPerm ? Result.Ok(true) : Result.Err("Permission denied");
  }
  if (!documentId) return Result.Err("Document ID is required");
  return (await this.documentRepository.findById(documentId))
    .map((doc) => doc.userId === userId).flatMap(async (isOwner) => {
      const hasPermission = await this.permissionRepository.hasPermission(role, action);
      return isOwner || hasPermission
        ? Result.Ok(true)
        : Result.Err("Permission denied");
    }).toPromise();
}
}