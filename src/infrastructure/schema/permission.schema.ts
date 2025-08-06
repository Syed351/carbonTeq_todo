import { pgTable, uuid, text, boolean } from "drizzle-orm/pg-core";
import { Roles } from "./roles.schema";

export const Permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().notNull(),
  roleId: uuid("role_id").notNull().references(() => Roles.id),
  action: text("action").notNull(), // e.g., "create", "read", etc.
  allowed: boolean("allowed").notNull()
});

export type PermissionSchema = typeof Permissions.$inferSelect;

