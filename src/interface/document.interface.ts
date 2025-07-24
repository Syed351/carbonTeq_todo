interface IDocument {
  id: string;
  name: string;
  tags: string|null;
  path: string;
  userId: string;
  createdat: Date;
  updatedat: Date;
}
interface PaginatedCollection<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface IDocumentCreate {
  name: string;
  tags: string;
  userId: string;
  path: string;
}
interface IDocumentUpdate {
  id: string;
  name?: string;
  tags?: string;
  path?: string;
 }

export {
  IDocument,
  PaginatedCollection,
  IDocumentCreate,
  IDocumentUpdate
}