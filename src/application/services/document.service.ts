import { Result } from "@carbonteq/fp";
import { IDocumentRepository } from "../../domain/repositories/document.repository";
import { IDocumentCreateDTO, IDocumentUpdateDTO, IDocumentDTO, PaginatedCollection } from "../dtos/document.dto";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { TOKENS } from "../../infrastructure/config/DI/token";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { ILogger } from "../../infrastructure/interface/logger.interface";
import { Request } from "express";
import { inject, injectable } from "tsyringe";
import { DocumentEntity } from "../../domain/entities/document.entity";
import { toDTO } from "../../infrastructure/mapper/document.mapper";
import { IDocumentService } from "../interfaces/document.inerface";

interface GetDocsOptions {
  page: number;
  limit: number;
  email?: string;
}

@injectable()
export class DocumentService implements IDocumentService {
  constructor(
    @inject(TOKENS.IDocumentRepository) private documentRepo: IDocumentRepository,
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.ILogger) private logger: ILogger
  ) {}

  async uploadDocument(file: Express.Multer.File, userId: string, data: IDocumentCreateDTO): Promise<Result<void, string>> {
    this.logger.info("Uploading document", { userId, fileName: file?.originalname, metadata: data });

    return Result.Ok(file)
      .flatMap((f) => f ? Result.Ok(f) : Result.Err("File is required"))
      .flatMap(() => {
        const relativePath = path.join("uploads", file.filename);
        const entity = DocumentEntity.create({
          name: data.name,
          tags: data.tags,
          path: relativePath,
          userId: userId
      });
        return this.documentRepo.create(entity);
      })
      .mapErr((err) => {
        this.logger.error("Upload failed", { error: err });
        return `Upload failed: ${err}`;
      })
      .toPromise();
  }

  async getDocuments({ page, limit }: GetDocsOptions): Promise<Result<PaginatedCollection<IDocumentDTO>, string>> {
    this.logger.info("Fetching documents", { page, limit });

    return Result.Ok({ page, limit })
      .flatMap(() => this.documentRepo.findAllPaginated(page, limit))
      .map((docs) => {
        const transformed = {
          ...docs,
          data: docs.data.map(toDTO),
        }
        this.logger.info("Documents fetched", {count: transformed.data.length });
        return transformed;
      })
      .toPromise();
  }

  async deleteDocument(documentId: string, userId: string, role: string): Promise<Result<void, string>> {
    this.logger.info("Deleting document", { documentId });

    return Result.Ok(documentId)
      .flatMap((id) => this.documentRepo.findById(id))
      .flatMap(() => this.documentRepo.delete(documentId,userId , role))
      .map(() => {
        this.logger.info("Document deleted", { documentId });
      })
      .mapErr((err) => {
        this.logger.error("Failed to delete document", { error: err });
        return `Failed to delete document: ${err}`;
      })
      .toPromise();
  }

  async updateDocument(documentId: string, data: Partial<IDocumentDTO>, file?: Express.Multer.File): Promise<Result<void, string>> {
    return Result.Ok(documentId)
      .flatMap((id) => this.documentRepo.findById(id))
      .flatMap((document) => {
         const updated = document.update( {
    name: data.name,
    tags: data.tags,
    path: file?.path,
  });
        return this.documentRepo.update(updated);
      })
      .toPromise();
  }

  async generateDownloadLink(
    documentId: string,
    userId: string,
    jwtSecret: string
  ): Promise<Result<string, string>> {
    this.logger.info("Generating download link", { documentId, userId });

    return Result.Ok(documentId)
      .flatMap((id) => this.documentRepo.findById(id))
      .flatMap((doc) => doc.userId === userId ? Result.Ok(doc) : Result.Err("Not authorized"))
      .map((doc) => {
        const token = jwt.sign({ documentId, userId }, jwtSecret, { expiresIn: "5m" });
        const link = `${process.env.SERVER_BASE_URL}/api/v1/documents/download/${token}`;
        this.logger.info("Download link generated", { documentId, link });
        return link;
      })
      .mapErr((err) => {
        this.logger.error("Failed to generate download link", { error: err });
        return err;
      })
      .toPromise();
  }

  async downloadDocument(token: string, jwtSecret: string): Promise<Result<{ filePath: string; rawFileName: string }, string>> {
    this.logger.info("Download document triggered", { token });

    return Result.Ok(token)
      .map((t) => jwt.verify(t, jwtSecret) as unknown)
      .flatMap((decoded) => typeof decoded === "object" && decoded !== null && "documentId" in decoded
        ? Result.Ok(decoded as { documentId: string })
        : Result.Err("Invalid or expired token")
      )
      .flatMap((decoded) => this.documentRepo.findById(decoded.documentId))
      .flatMap((doc) => {
        const fullPath = path.join(process.cwd(), doc.path);
        return fs.promises.access(fullPath)
          .then(() => Result.Ok({ filePath: fullPath, rawFileName: path.basename(doc.path) }))
          .catch(() => Result.Err("File not found on disk"));
      })
      .mapErr((err) => {
        this.logger.error("Download document failed", { token, error: err });
        return err;
      })
      .toPromise();
  }

  async searchDocuments(tags: string | undefined): Promise<Result<IDocumentDTO[], string>> {
    this.logger.info("Searching documents by tags", { tags });

    return Result.Ok(tags)
      .flatMap((t) => t && t.trim() !== "" ? Result.Ok(t.split(",").map(tag => tag.trim().toLowerCase())) : Result.Ok([]))
      .flatMap(async (tagArray) => tagArray.length > 0 ? this.documentRepo.searchByTags(tagArray) : Result.Ok([]))
      .map((docs) => {
        this.logger.info("Documents found", { count: docs.length });
        return docs.map(toDTO);
      })
      .mapErr((err) => {
        this.logger.error("Search failed", { error: err });
        return `Failed to search documents: ${err}`;
      })
      .toPromise();
  }
}
