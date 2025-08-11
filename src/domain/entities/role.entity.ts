// entities/role.entity.ts
export interface IRole {
  id: string;
  name: string;
}

export class RoleEntity implements IRole {
  constructor(
    public id: string, 
    public name: string
  ) {}

  static create(id: string, name: string): RoleEntity {
    return new RoleEntity(id, name);
  }

  toObject(): IRole {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
