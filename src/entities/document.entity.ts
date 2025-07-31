// entities/document.entity.ts

export interface IDocument {
  id: string;
  name: string;
  tags: string | null;
  path: string;
  userId: string;
  createdat: Date;
  updatedat: Date;
}

export interface IDocumentCreate {
  name: string;
  tags: string | null;
  userId: string;
  path: string;
}

export class DocumentEntity implements IDocument {
  constructor(
    public id: string,
    public name: string,
    public tags: string | null,
    public path: string,
    public userId: string,
    public createdat: Date,
    public updatedat: Date
  ) {}

  static fromExisting(props: IDocument): DocumentEntity {
    return new DocumentEntity(
      props.id,
      props.name,
      props.tags,
      props.path,
      props.userId,
      props.createdat,
      props.updatedat
    );
  }

  static create(name: string, tags: string|null , path: string, userId: string): DocumentEntity {
    const now = new Date();
    return new DocumentEntity(
      crypto.randomUUID(),
      name,
      tags,
      path,
      userId,
      now,
      now
    );
  }
  // inside DocumentEntity class

static update(
  entity: DocumentEntity,
  props: Partial<Omit<IDocument, "id" | "createdat" | "userId">>
): DocumentEntity {
  return new DocumentEntity(
    entity.id,
    props.name ?? entity.name,
    props.tags ?? entity.tags,
    props.path ?? entity.path,
    entity.userId,
    entity.createdat,
    new Date() // update timestamp
  );
}


  fromDTO() {
    return {
      id: this.id,
      name: this.name,
      tags: this.tags,
      path: this.path,
      userId: this.userId,
      createdat: this.createdat,
      updatedat: this.updatedat
    };
  }
}
