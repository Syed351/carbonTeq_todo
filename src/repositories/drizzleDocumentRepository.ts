import { Result } from "@carbonteq/fp";
import { db } from "../db";
import { Documents } from "../schema/document.schema";
import { eq, or, ilike, sql, desc } from "drizzle-orm";
import { IDocumentRepository } from "../interface/document.repository";
import { DocumentEntity } from "../entities/document.entity";
import { PaginatedCollection } from "../dtos/documentDTO";





export class DrizzleDocumentRepository implements IDocumentRepository {
  async create(doc: DocumentEntity): Promise<Result<void, string>> {
    try {
      await db.insert(Documents).values({
        id: doc.id,
        name: doc.name,
        tags: doc.tags,
        path: doc.path,
        userId: doc.userId,
        createdat: doc.createdat,
        updatedat: doc.updatedat
      });
      return Result.Ok(undefined);
    } catch {
      return Result.Err("Failed to insert document");
    }
  }

  async findById(id: string): Promise<Result<DocumentEntity, string>> {
    return db
      .select()
      .from(Documents)
      .where(eq(Documents.id, id))
      .limit(1)
      .then((rows) => {
        const doc = rows[0];
        return doc
          ? Result.Ok(DocumentEntity.fromExisting(doc))
          : Result.Err("Document not found");
      })
      .catch(() => Result.Err("DB error"));
  }

  async findByUserId(userId: string): Promise<Result<DocumentEntity[], string>> {
    return db
      .select()
      .from(Documents)
      .where(eq(Documents.userId, userId))
      .then((docs) => Result.Ok(docs.map(DocumentEntity.fromExisting)))
      .catch(() => Result.Err("Database error"));
  }

  async findAll(): Promise<Result<DocumentEntity[], string>> {
    try {
      const docs = await db.select().from(Documents);
      return Result.Ok(docs.map(DocumentEntity.fromExisting));
    } catch {
      return Result.Err("Failed to fetch documents");
    }
  }

  async update(doc: DocumentEntity): Promise<Result<void, string>> {
    try {
      const result = await db
        .update(Documents)
        .set({
          name: doc.name,
          tags: doc.tags,
          path: doc.path,
          updatedat: new Date(),
        })
        .where(eq(Documents.id, doc.id));

      return result.rowCount === 0
        ? Result.Err("Document not updated")
        : Result.Ok(undefined);
    } catch {
      return Result.Err("Update failed");
    }
  }

  async delete(documentId: string): Promise<Result<void, string>> {
    try {
      const deleted = await db
        .delete(Documents)
        .where(eq(Documents.id, documentId)).returning();

      return deleted.length > 0
        ? Result.Ok(undefined)
        : Result.Err("Document not found to delete");
    } catch {
      return Result.Err("DB error during delete");
    }
  }

  async searchByTags(tags: string[]): Promise<Result<DocumentEntity[], string>> {
    try {
      const results = tags.length === 0
        ? await db.select().from(Documents)
        : await db.select().from(Documents).where(or(...tags.map(tag => ilike(Documents.tags, `%${tag}%`))));

      return Result.Ok(results.map(DocumentEntity.fromExisting));
    } catch {
      return Result.Err("Failed to search");
    }
  }

  async findAllPaginated(
    page: number,
    limit: number
  ): Promise<Result<PaginatedCollection<DocumentEntity>, string>> {
    try {
      const offset = (page - 1) * limit;

      const result = await db
        .select()
        .from(Documents)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(Documents.createdat));

      const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(Documents);
      const total = Number(countRow.count);
      const totalPages = Math.ceil(total / limit);

      return Result.Ok({
        data: result.map(DocumentEntity.fromExisting),
        meta: { total, page, limit, totalPages },
      });
    } catch {
      return Result.Err("Failed to paginate");
    }
  }

  async countAll(): Promise<Result<number, string>> {
    try {
      const result = await db.select({ count: sql<number>`count(*)` }).from(Documents);
      return Result.Ok(result[0].count);
    } catch {
      return Result.Err("Count failed");
    }
  }
}
