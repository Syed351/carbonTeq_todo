import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { eq, ilike, and } from "drizzle-orm";
import { db } from "../db";
import { Documents } from "../schema/document.schema";
import { User } from "../schema/user.schema";
import { IDocument } from "../interface/document.interface";
import ApiError from "../utils/ApiErrors";
import { DocumentInput } from "../dtos/document.dto";


const uploadDocumentService = async (input: DocumentInput, filePath: string, userId: string) => {
  const newDoc: IDocument = {
    id: uuidv4(),
    name: input.name,
    tags: input.tags,
    path: filePath,
    userId,
    createdat: new Date(),
    updatedat: new Date(),
  };

  await db.insert(Documents).values(newDoc);
};

const getDocumentsService = async (email?: string) => {
  if (email) {
    const [user] = await db.select().from(User).where(eq(User.email, email));
    if (!user) throw new ApiError(404, "User not found");

    return await db.select().from(Documents).where(eq(Documents.userId, user.id));
  }

  return await db.select().from(Documents);
};


const deleteDocumentService = async (documentId: string, user: any) => {
  const [document] = await db.select().from(Documents).where(eq(Documents.id, documentId));
  if (!document) throw new ApiError(404, "Document not found");

  if (document.userId !== user.id && user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized");
  }

  try {
    fs.unlinkSync(document.path);
  } catch {
    throw new ApiError(500, "File not found on server");
  }

  await db.delete(Documents).where(eq(Documents.id, documentId));
};


const updateDocumentService = async (
  documentId: string,
  input: DocumentInput,
  filePath: string | undefined
) => {
  const [document] = await db.select().from(Documents).where(eq(Documents.id, documentId));
  if (!document) throw new ApiError(404, "Document not found");

  if (filePath) {
    try {
      fs.unlinkSync(document.path);
    } catch {
      console.warn("Old file not found");
    }
  }

  await db.update(Documents).set({
    name: input.name,
    tags: input.tags,
    path: filePath || document.path,
    updatedat: new Date(),
  }).where(eq(Documents.id, documentId));
};


const generateDownloadLinkService = async (documentId: string, user: any, req: any) => {
  const [document] = await db.select().from(Documents).where(eq(Documents.id, documentId));
  if (!document) throw new ApiError(403, "Document not found");

  if (document.userId !== user.id) {
    throw new ApiError(403, "Unauthorized");
  }

  const token = jwt.sign({ documentId, userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "5m" });
  return `${req.protocol}://${req.get("host")}/api/v1/documents/download/${token}`;
};


const downloadDocumentService = async (token: string) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { documentId: string };
  const [document] = await db.select().from(Documents).where(eq(Documents.id, decoded.documentId));
  if (!document) throw new ApiError(403, "Document not found");

  const absolutePath = path.join(process.cwd(), document.path);
  if (!fs.existsSync(absolutePath)) throw new ApiError(404, "File not found");

  const rawName = path.basename(document.path);
  const safeFileName = rawName.replace(/[\r\n\"<>]/g, "_").replace(/\s+/g, "_");

  return { path: absolutePath, filename: safeFileName };
};


const searchDocumentsService = async (tagQuery?: string) => {
  const conditions: any[] = [];

  if (tagQuery) {
    const tagsArray = tagQuery.split(",").map(t => t.trim().toLowerCase());
    const likeConditions = tagsArray.map(tag => ilike(Documents.tags, `%${tag}%`));
    conditions.push(...likeConditions);
  }

  return await db
    .select()
    .from(Documents)
    .where(conditions.length ? and(...conditions) : undefined);
};



export {
  uploadDocumentService,
  getDocumentsService,
  deleteDocumentService,
  updateDocumentService,
  generateDownloadLinkService,
  downloadDocumentService,
  searchDocumentsService
};