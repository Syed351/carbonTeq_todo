import { pgTable, varchar ,uuid } from "drizzle-orm/pg-core";
import { Roles } from "./roles.schema";

export const User = pgTable("users",  {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  roleId: uuid("role_id").notNull().references(() => Roles.id),
  refreshToken: varchar({ length: 255 }).notNull(),
});

