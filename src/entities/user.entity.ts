export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  roleId: string;
  refreshToken: string;
}

export class UserEntity implements IUser {
  public id: string;
  public name: string;
  public email: string;
  public password: string;
  public roleId: string;
  public refreshToken: string;

  private constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    roleId: string,
    refreshToken: string
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.roleId = roleId;
    this.refreshToken = refreshToken;
  }

  static create(user: IUser): UserEntity {
  return new UserEntity(
    user.id,
    user.name,
    user.email,
    user.password,
    user.roleId,
    user.refreshToken
  );
}

  static fromObject(obj: IUser): UserEntity {
    return new UserEntity(
      obj.id,
      obj.name,
      obj.email,
      obj.password,
      obj.roleId,
      obj.refreshToken
    );
  }

  toObject(): IUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      roleId: this.roleId,
      refreshToken: this.refreshToken,
    };
  }
}
