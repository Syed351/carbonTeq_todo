export interface IPermissionRepository {
  hasPermission(roleName: string, action: "create" | "read" | "update" | "delete"): Promise<boolean>;
}