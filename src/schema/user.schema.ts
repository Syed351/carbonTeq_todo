import {pgEnum, pgTable, varchar ,uuid } from "drizzle-orm/pg-core";
export const roleEnum = pgEnum("role",["Admin","User"])

export const User = pgTable("users",  {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: roleEnum('role').notNull(),
  refreshToken: varchar({ length: 255 }).notNull(),
});

