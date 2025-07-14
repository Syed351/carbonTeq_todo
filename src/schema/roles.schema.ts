import { pgTable , uuid , varchar} from  "drizzle-orm/pg-core";

export const Roles = pgTable ("roles",{
    id:uuid("id").primaryKey().notNull(),
    name: varchar({ length: 50 }).notNull().unique(),
})
export type RoleSchema = typeof Roles.$inferSelect;