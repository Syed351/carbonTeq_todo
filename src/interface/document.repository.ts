import { Result } from "@carbonteq/fp";
import { DocumentEntity } from "../entities/document.entity";
import { PaginatedCollection } from "../dtos/documentDTO";

export interface IDocumentRepository {
  create(doc: DocumentEntity): Promise<Result<void, string>>;
  findById(id: string): Promise<Result<DocumentEntity, string>>;
  findByUserId(userId: string): Promise<Result<DocumentEntity[], string>>;
  findAll(): Promise<Result<DocumentEntity[], string>>;
  delete(documentId: string, userId: string, role: string): Promise<Result<void, string>>;
  update(doc: DocumentEntity): Promise<Result<void, string>>;
  searchByTags(tags: string[]): Promise<Result<DocumentEntity[], string>>;
  findAllPaginated(page: number, limit: number): Promise<Result<PaginatedCollection<DocumentEntity>, string>>;
  countAll(): Promise<Result<number, string>>;
}
