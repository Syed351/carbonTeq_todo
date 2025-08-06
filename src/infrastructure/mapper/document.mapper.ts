import { IDocumentDTO } from "../../application/dtos/document.dto";
import { DocumentEntity } from "../../domain/entities/document.entity";

export function toDTO(entity: DocumentEntity): IDocumentDTO {
  return {
    id: entity.id,
    name: entity.name,
    tags: entity.tags,
    path: entity.path,
    userId: entity.userId,
    createdat: entity.createdat,
    updatedat: entity.updatedat,
  };
}