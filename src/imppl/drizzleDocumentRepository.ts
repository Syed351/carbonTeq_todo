import { db } from "../db";
import { Documents } from "../schema/document.schema";
import { eq, and, ilike } from "drizzle-orm";
import { IDocument, IDocumentCreate, IDocumentUpdate } from "../interface/document.interface";
import { IDocumentRepository } from "../repositories/document.repository";
import { v4 as uuidv4 } from "uuid";

export class DrizzleDocumentRepository implements IDocumentRepository {
  async create(doc: IDocumentCreate): Promise<void> {
    await db.insert(Documents).values({
      id: uuidv4(),
      name: doc.name,
      tags: doc.tags,
      path: doc.path,
      userId: doc.userId,
      createdat: new Date(),
      updatedat: new Date(),
    });
  }

  async findByUserId(userId: string): Promise<IDocument[]> {
        return await db.select().from(Documents).where(eq(Documents.userId, userId));
    }
  async findAll() : Promise<IDocument[]> {
    return await db.select().from(Documents);
  }

  async update(id: string, data: IDocumentUpdate): Promise<void> {
    await db.update(Documents).set({
      name: data.name,
      tags: data.tags,
      path: data.path,
      updatedat: new Date(),
    }).where(eq(Documents.id, data.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(Documents).where(eq(Documents.id, id));
  }

  async searchByTags(tags: string[]): Promise<IDocument[]> {
    if (tags.length === 0) {
      return await db.select().from(Documents);
    }

    const conditions = tags.map(tag => ilike(Documents.tags, `%${tag}%`));
    return await db.select().from(Documents).where(and(...conditions));
  }

  async findById(id: string): Promise<IDocument | null> {
    const [doc] = await db.select().from(Documents).where(eq(Documents.id, id));
    return doc ?? null;
  }
}
