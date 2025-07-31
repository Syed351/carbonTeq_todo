// dtos/documentDTO.ts
export interface IDocumentDTO {
  id: string;
  name: string;
  tags: string | null;
  path: string;
  userId: string;
  createdat: Date;
  updatedat: Date;
}

export interface IDocumentCreateDTO {
  name: string;
  tags: string | null;
  userId: string;
  path: string;
}

export interface IDocumentUpdateDTO {
  id: string;
  name?: string;
  tags?: string | null;
  path?: string;
}

export interface PaginatedCollection<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
 