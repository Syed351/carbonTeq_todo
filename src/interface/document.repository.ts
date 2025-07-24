// IDocumentRepository.ts
import { Result } from "@carbonteq/fp";
import { IDocument, IDocumentCreate, IDocumentUpdate , PaginatedCollection } from "./document.interface";

export interface IDocumentRepository {
  create(doc: IDocumentCreate): Promise<Result<void, string>>;
  findById(id: string): Promise<Result<IDocument,string >>;
  findByUserId(userId: string): Promise<Result<IDocument[],String>>;
  findAll(): Promise<Result<IDocument[], string>>;
  delete(documentId: string, userId: string, role: string): Promise<Result<void, string>>;
  update(id: string, data: IDocumentUpdate): Promise<Result<void, string>>;
  searchByTags(tags: string[]): Promise<Result<IDocument[], string>>;
  findAllPaginated(page: number, limit: number): Promise<Result<PaginatedCollection<IDocument>, string>>
  countAll(): Promise<Result<number, string>>;
}
