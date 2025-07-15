// services/document.service.ts

import { IDocumentRepository } from "../repositories/document.repository";
import { IDocumentCreate, IDocumentUpdate , IDocument} from "../interface/document.interface";
import { IUserRepository } from "../repositories/user.repository"; 
import { ApiError } from "../utils/ApiErrors";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { Request } from "express";


export class DocumentService {
  constructor(
    private docRepo: IDocumentRepository,
    private userRepo: IUserRepository
  ) {}

  async uploadDocument(file: Express.Multer.File, userId: string, data: IDocumentCreate): Promise<string> {
    if (!file) throw new ApiError(400, "File is required");

    const relativePath = path.join("uploads", file.filename);

    await this.docRepo.create({
      name: data.name,
      tags: data.tags,
      path: relativePath,
      userId
    });

    return relativePath;
  }

async getDocuments(email?: string): Promise<IDocument[]> {
  if (!email) return this.docRepo.findAll();

  const user = await this.userRepo.findByEmail(email);
  if (!user) throw new ApiError(404, "User not found");

  return this.docRepo.findByUserId(user.id);
}

  async deleteDocument(documentId: string, userId: string, role: string) {
    const document = await this.docRepo.findById(documentId);
    if (!document) throw new ApiError(404, "Document not found");

    if (document.userId !== userId && role !== "Admin") {
      throw new ApiError(403, "Not authorized");
    }

    try {
      fs.unlinkSync(document.path);
    } catch {
      throw new ApiError(500, "File not found on disk");
    }

    await this.docRepo.delete(documentId);
  }

  async updateDocument(documentId: string, userId: string, file: Express.Multer.File | undefined, data: IDocumentUpdate) {
    const document = await this.docRepo.findById(documentId);
    if (!document) throw new ApiError(404, "Document not found");

    if (file?.path) {
      try {
        fs.unlinkSync(document.path);
      } catch {
        console.warn("Old file not found");
      }
    }

    await this.docRepo.update(documentId, {
      id: documentId,
      name: data.name ?? document.name,
      tags: data.tags ??(document.tags ?? undefined),
      path: file?.path ?? document.path,
      userId,
    });
  }

  async generateDownloadLink(documentId: string, userId: string, jwtSecret: string, req: Request): Promise<string> {
    const document = await this.docRepo.findById(documentId);
    if (!document) throw new ApiError(404, "Document not found");
    if (document.userId !== userId) throw new ApiError(403, "Not authorized");

    const token = jwt.sign({ documentId, userId }, jwtSecret, { expiresIn: "5m" });
    return `${req.protocol}://${req.get("host")}/api/v1/documents/download/${token}`;
  }

  async downloadDocument(token: string, jwtSecret: string) {
    const decoded = jwt.verify(token, jwtSecret) as { documentId: string };
    const document = await this.docRepo.findById(decoded.documentId);
    if (!document) throw new ApiError(404, "Document not found");

    const absPath = path.join(process.cwd(), document.path);
    if (!fs.existsSync(absPath)) throw new ApiError(404, "File not found");

    return { filePath: absPath, rawFileName: path.basename(document.path) };
  }

async searchDocuments(tags: string | undefined) {
  const tagArray = tags
    ? tags.split(",").map((tag) => tag.trim().toLowerCase())
    : [];

  return await this.docRepo.searchByTags(tagArray);
}
}
