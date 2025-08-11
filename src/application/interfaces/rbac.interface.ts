import { Result } from "@carbonteq/fp"

export interface IRbacService {
  canAccess(userId: string, role: string, documentId: string | undefined, action: "create" | "read" | "update" | "delete"): Promise<Result<boolean , string>>;
}