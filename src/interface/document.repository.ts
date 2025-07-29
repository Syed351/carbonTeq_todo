// IDocumentRepository.ts
import { Result } from "@carbonteq/fp";
import { IDocumentDTO, IDocumentCreateDTO, IDocumentUpdateDTO , PaginatedCollection } from "../dtos/documentDTO";

export interface IDocumentRepository {
  create(doc: IDocumentCreateDTO): Promise<Result<void, string>>;
  findById(id: string): Promise<Result<IDocumentDTO,string >>;
  findByUserId(userId: string): Promise<Result<IDocumentDTO[],String>>;
  findAll(): Promise<Result<IDocumentDTO[], string>>;
  delete(documentId: string, userId: string, role: string): Promise<Result<void, string>>;
  update(id: string, data: IDocumentUpdateDTO): Promise<Result<void, string>>;
  searchByTags(tags: string[]): Promise<Result<IDocumentDTO[], string>>;
  findAllPaginated(page: number, limit: number): Promise<Result<PaginatedCollection<IDocumentDTO>, string>>
  countAll(): Promise<Result<number, string>>;
}
