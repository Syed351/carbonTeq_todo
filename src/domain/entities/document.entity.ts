import { v4 as uuidv4 } from "uuid";
import { TagValueObject } from "../valueObjects/tagsVO";

export interface IDocument {
  id: string;
  name: string;
  tags: string | null;
  path: string;
  userId: string;
  createdat: Date;
  updatedat: Date;
}

export class DocumentEntity implements IDocument {
  private constructor(
    public readonly id: string,
    private _name: string,
    private _tags: string | null,
    private _path: string,
    public readonly userId: string,
    public readonly createdat: Date,
    public updatedat: Date
  ) {}

  get name(): string {
    return this._name;
  }

  get tags(): string | null {
    return this._tags;
  }

  get path(): string {
    return this._path;
  }

  static create(props: {
    name: string;
    tags: string | null;
    path: string;
    userId: string;
    id?: string;
    createdat?: Date;
    updatedat?: Date;
  }): DocumentEntity {
    const now = new Date();

    if (!props.name.trim()) throw new Error("Name is required");
    if (!props.path.trim()) throw new Error("Path is required");
    if (!props.userId.trim()) throw new Error("User ID is required");

    const tagVO = TagValueObject.create(props.tags);
    return new DocumentEntity(
      props.id ?? uuidv4(),
      props.name,
      tagVO.value,
      props.path,
      props.userId,
      props.createdat ?? now,
      props.updatedat ?? now
    );
  }


  update(props: Partial<Omit<IDocument, "id" | "createdat" | "userId">>): DocumentEntity {
    return new DocumentEntity(
      this.id,
      props.name ?? this._name,
      props.tags ?? this._tags,
      props.path ?? this._path,
      this.userId,
      this.createdat,
      new Date() // updatedAt
    );
  }
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
}
