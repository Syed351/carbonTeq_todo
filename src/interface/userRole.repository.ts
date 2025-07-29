import { Roles } from "../schema/roles.schema";
import { Result } from "@carbonteq/fp"


export interface IRoleRepository {
  findByName(roleName: string): Promise<Result<typeof Roles.$inferSelect , string>>;
}
