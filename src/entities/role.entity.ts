// entities/role.entity.ts
import type { IRole } from "../dtos/RoleDTO";

export class RoleEntity implements IRole {
  constructor(public id: string, public name: string) {}

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
