import { Roles } from "../schema/roles.schema";

export interface IRoleRepository {
  findByName(roleName: string): Promise<typeof Roles.$inferSelect | undefined>;
}
