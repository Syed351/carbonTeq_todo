export interface IDocument {
  id: string;
  name: string;
  tags: string|null;
  path: string;
  userId: string;
  createdat: Date;
  updatedat: Date;
}
export interface IDocumentCreate {
  name: string;
  tags: string;
  userId: string;
}
export interface IDocumentUpdate {
  id: string;
  name?: string;
  tags?: string;
  path?: string;
  userId?: string;
}


