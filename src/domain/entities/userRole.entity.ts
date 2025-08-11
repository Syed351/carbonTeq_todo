
export interface IUserWithRole {
  id: string;
  name: string;
  email: string;
  role: string;
}

export class UserWithRoleEntity implements IUserWithRole {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: string
  ) {}

  static fromObject(obj: IUserWithRole): UserWithRoleEntity {
    return new UserWithRoleEntity(obj.id, obj.name, obj.email, obj.role);
  }
}