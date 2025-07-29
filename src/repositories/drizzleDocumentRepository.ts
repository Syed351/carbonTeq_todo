import { Result, Option } from "@carbonteq/fp";
import { db } from "../db";
import { Documents } from "../schema/document.schema";
import { eq, or , ilike ,sql , desc} from "drizzle-orm";
import { IDocumentDTO, IDocumentCreateDTO, IDocumentUpdateDTO , PaginatedCollection } from "../dtos/documentDTO";
import { IDocumentRepository } from "../interface/document.repository";
import { v4 as uuidv4 } from "uuid";



export class DrizzleDocumentRepository implements IDocumentRepository {
  async create(doc: IDocumentCreateDTO): Promise<Result<void, string>> {
    try {
      await db.insert(Documents).values({
        id: uuidv4(),
        name: doc.name,
        tags: doc.tags,
        path: doc.path,
        userId: doc.userId,
        createdat: new Date(),
        updatedat: new Date(),
      });
      return Result.Ok(undefined);
    } catch (err) {
        return Result.Err("Failed to insert document into database");
    }
  }
async findByUserId(userId: string): Promise<Result<IDocumentDTO[], string>> {
  return db
    .select()
    .from(Documents)
    .where(eq(Documents.userId, userId))
    .then((docs) =>
      docs.length > 0 ? Result.Ok(docs) : Result.Err("No documents found for this user")
    )
    .catch(() => Result.Err("Database error"));
}



  async findAll(): Promise<Result<IDocumentDTO[], string>> {
    try {
      const docs = await db.select().from(Documents);
      return Result.Ok(docs);
    } catch {
      return Result.Err("Failed to fetch all documents");
    }
  }


async update(id: string, data: IDocumentUpdateDTO): Promise<Result<void, string>> {
  try {
    const updated = await db
      .update(Documents)
      .set({
        name: data.name,
        tags: data.tags,
        path: data.path,
        updatedat: new Date(),
      })
      .where(eq(Documents.id, id));

    if (updated.rowCount === 0) {
      return Result.Err("No document updated, possibly invalid ID");
    }

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err("Database update failed");
  }
}



  async delete(documentId: string, userId: string, role: string): Promise<Result<void, string>> {
  try {
    const deleted = await db
      .delete(Documents)
      .where(eq(Documents.id, documentId)) // ✅ use the correct param
      .returning({ id: Documents.id });

    return deleted.length > 0
      ? Result.Ok(undefined) // ✅ successful delete
      : Result.Err("Document not found to delete"); // ✅ no matching ID
  } catch (error) {
    return Result.Err("Database error during delete"); // ✅ error case
  }
}


    async searchByTags(tags: string[]): Promise<Result<IDocumentDTO[], string>> {
  try {
    if (tags.length === 0) {
      const allDocs = await db.select().from(Documents);
      return Result.Ok(allDocs);
    }

    const conditions = tags.map(tag => ilike(Documents.tags, `%${tag}%`));
    const results = await db
      .select()
      .from(Documents)
      .where(or(...conditions)); // ✅ FIXED: use `or` not `and`

    return Result.Ok(results);
  } catch {
    return Result.Err("Failed to search documents by tags");
  }
}

 async findById(id: string): Promise<Result<IDocumentDTO, string>> {
  // Wrap the DB query in a promise that resolves Result
  return db
    .select()
    .from(Documents)
    .where(eq(Documents.id, id))
    .limit(1)
    .then((rows) => {
      const doc = rows[0];
      return doc ? Result.Ok(doc) : Result.Err("Document not found");
    })
    .catch(() => Result.Err("Database error"));
}


  
  async findAllPaginated(
    page: number,
    limit: number
  ): Promise<Result<PaginatedCollection<IDocumentDTO>, string>> {
    try {
      const offset = (page - 1) * limit;

      const result = await db
        .select()
        .from(Documents)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(Documents.createdat));

      const [countRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(Documents);

      const total = Number(countRow.count) || 0;
      const totalPages = Math.ceil(total / limit);

      return Result.Ok({
        data: result,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    } catch (err) {
      return Result.Err("Failed to fetch paginated documents");
    }
  }
    
    async countAll(): Promise<Result<number, string>> {
    try {
      const result = await db.select({ count: sql<number>`count(*)` }).from(Documents);
      return Result.Ok(result[0].count);
    } catch {
      return Result.Err("Failed to count all documents");
    }
  }


}



