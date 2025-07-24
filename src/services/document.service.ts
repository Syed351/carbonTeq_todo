// services/document.service.ts
import { Result } from "@carbonteq/fp";
import { IDocumentRepository } from "../interface/document.repository";
import { IDocumentCreate, IDocumentUpdate , IDocument , PaginatedCollection} from "../interface/document.interface";
import { IUserRepository } from "../interface/user.repository"; 
import { ApiError } from "../utils/ApiErrors";
import { TOKENS } from "../token";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { ILogger } from "../interface/logger.interface";
import { Request } from "express";
import { inject,injectable } from "tsyringe";

interface GetDocsOptions {
  page: number;
  limit: number;
  email?: string;
}
@injectable()
export class DocumentService {
  constructor(
    @inject(TOKENS.IDocumentRepository) private documentRepo: IDocumentRepository,
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
    @inject (TOKENS.ILogger) private logger: ILogger
  ) {}

  async uploadDocument(file: Express.Multer.File, userId: string, data: IDocumentCreate): Promise<Result<void, string>> {
    this.logger.info("Uploading document", { userId, fileName: file?.originalname, metadata: data });
    if (!file) {
      this.logger.error("No file provided");
      throw new ApiError(400, "File is required");
    }
    const relativePath = path.join("uploads", file.filename);
    const result = await this.documentRepo.create({
      name: data.name,
      tags: data.tags,
      path: relativePath,
      userId
    });
    this.logger.info("Document uploaded", { userId, path: relativePath });
    return result.mapErr((err) => `Upload failed: ${err}`);
  }

async getDocuments({ page, limit }: GetDocsOptions): Promise<Result<PaginatedCollection<IDocument>, string>> {
  this.logger.info("Fetching documents", { page, limit });
  return this.documentRepo.findAllPaginated(page, limit);
}

async deleteDocument(
  documentId: string,
  userId: string,
  role: string
): Promise<Result<void, string>> {
  const docOpt = await this.documentRepo.findById(documentId);
  const authRes = docOpt
    .map((doc) =>
      role === "admin" || doc.userId === userId
        ? Result.Ok(doc)
        : Result.Err("You are not authorized to delete this document")
    ).flatMap((res) => res);
  if (authRes.isErr()) return Result.Err(authRes.unwrapErr());
  const deleteRes = await this.documentRepo.delete(documentId, userId, role);
  return deleteRes
    .map(() => undefined)
    .mapErr((e) => `Failed to delete document: ${e}`);
}

async updateDocument(
  documentId: string,
  data: Partial<IDocument>,
  file?: Express.Multer.File
): Promise<Result<void, string>> {
  return await Result.Ok(documentId).flatMap((id) => this.documentRepo.findById(id)).flatMap((document) => {
      const updatedData: IDocumentUpdate = {
        id: documentId,
        name: data.name ?? document.name,
        tags: data.tags ?? document.tags ?? undefined,
        path: file?.path ?? document.path,
      };
      return this.documentRepo.update(documentId, updatedData);
    })
    .toPromise();
}

async generateDownloadLink(
  documentId: string,
  userId: string,
  jwtSecret: string,
  req: Request
): Promise<Result<string, string>> {
  this.logger.info("Generating download link", { documentId, userId });
  return await Result.Ok(documentId).flatMap((id) => this.documentRepo.findById(id)).flatMap((doc) =>
      doc.userId === userId
        ? Result.Ok(doc)
        : Result.Err("Not authorized")
    ).map((doc) => {
      const token = jwt.sign({ documentId, userId }, jwtSecret, {
        expiresIn: "5m",
      });
      const link = `${req.protocol}://${req.get("host")}/api/v1/documents/download/${token}`;
      this.logger.info("Download link generated", { documentId, link });
      return link;
    }).mapErr((err) => {
      this.logger.error("Failed to generate download link", {
        documentId,
        userId,
        error: err,
      });
      return err;
    }).toPromise(); // convert Result to Promise<Result<string, string>>
}

async downloadDocument(
  token: string,
  jwtSecret: string
): Promise<Result<{ filePath: string; rawFileName: string }, string>> {
  this.logger.info("Download document triggered", { token });
  return Result.Ok(token).map((t) => jwt.verify(t, jwtSecret) as unknown).flatMap((decoded) =>
      typeof decoded === "object" &&
      decoded !== null &&
      "documentId" in decoded
        ? Result.Ok(decoded as { documentId: string })
        : Result.Err("Invalid or expired token")
    ).flatMap((decoded) => this.documentRepo.findById(decoded.documentId)).flatMap((doc) => {
      const fullPath = path.join(process.cwd(), doc.path);
      return fs.promises
        .access(fullPath)
        .then(() =>
          Result.Ok({
            filePath: fullPath,
            rawFileName: path.basename(doc.path),
          })
        ).catch(() => Result.Err("File not found on disk"));
    })
    .mapErr((err) => {
      this.logger.error("Download document failed", { token, error: err });
      return err;
    }).toPromise();
}

async searchDocuments(tags: string | undefined): Promise<Result<IDocument[], string>> {
  const tagArray = tags ? tags.split(",").map((tag) => tag.trim().toLowerCase()) : [];
  this.logger.info("Searching documents by tags", { tags: tagArray });
  const result = await this.documentRepo.searchByTags(tagArray);
  return result
    .map((docs) => {
      this.logger.info("Documents found", { count: docs.length });
      return docs;
    }).mapErr((err) => {
      this.logger.error("Search failed", { error: err });
      return "Failed to search documents";
    });
}
};
