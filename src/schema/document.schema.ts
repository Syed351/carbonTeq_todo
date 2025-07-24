import {pgTable , uuid , varchar , text ,timestamp} from "drizzle-orm/pg-core";
import { User } from "./user.schema";


export const Documents = pgTable ("documents",{

    id : uuid("id").primaryKey().notNull(),
    name :varchar({ length: 255}).notNull(),
    tags: varchar({ length: 255 }),
    path: text("path").notNull(),
    userId : uuid ("user_Id").notNull().references(()=> User.id),
    createdat : timestamp("created_at").notNull(),
    updatedat : timestamp("updated_at").notNull()

})

