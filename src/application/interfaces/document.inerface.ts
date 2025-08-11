import { IDocumentCreateDTO , IDocumentUpdateDTO , IDocumentDTO, PaginatedCollection } from "../dtos/document.dto";
import { Result } from "@carbonteq/fp";


export interface IDocumentService{
        uploadDocument(file: Express.Multer.File,userId: string,data: IDocumentCreateDTO): Promise<Result<void, string>>;
        getDocuments({ page, limit }: { page: number; limit: number }): Promise<Result<PaginatedCollection<IDocumentDTO>, string>>
        updateDocument(documentId: string, data: Partial<IDocumentDTO>, file?: Express.Multer.File): Promise<Result<void, string>>;
        deleteDocument(documentId: string, userId: string, role: string): Promise<Result<void, string>>;
        generateDownloadLink(documentId: string, userId: string, jwtSecret: string): Promise<Result<string, string>>;
        downloadDocument(token: string, jwtSecret: string): Promise<Result<{ filePath: string; rawFileName: string }, string>>;
        searchDocuments(tags?: string): Promise<Result<IDocumentDTO[], string>>;

}