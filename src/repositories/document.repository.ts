import { IDocument, IDocumentCreate, IDocumentUpdate } from "../interface/document.interface";

export interface IDocumentRepository {
  create(doc: IDocumentCreate): Promise<void>;
  findById(id: string): Promise<IDocument | null>;
  findByUserId(userId: string): Promise<IDocument[]>;
  findAll(): Promise<IDocument[]>;
  delete(id: string): Promise<void>;
  update(id: string, data: IDocumentUpdate): Promise<void>;
  searchByTags(tags: string[]): Promise<IDocument[]>;
}