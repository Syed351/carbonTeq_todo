import { v4 as uuidv4 } from "uuid";
import { EmailVO } from "../valueObjects/emailVO";


export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  refreshToken: string;
  roleId: string;
}

export class UserEntity implements IUser {
  private constructor(
    public readonly id: string,
    private _name: string,
    private _email: EmailVO,
    private _password: string,
    private _refreshToken: string,
    public readonly roleId: string
  ) {}

  // Getters
  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email.value;
  }

  get password(): string {
    return this._password;
  }

  get refreshToken(): string {
    return this._refreshToken;
  }

  // Factory method
  static create(props: {
    name: string;
    email: string;
    password: string;
    refreshToken: string;
    roleId: string;
    id?: string;
  }): UserEntity {
    const { name, email, password, refreshToken, roleId, id = uuidv4() } = props;


    const emailVO = EmailVO.create(email);

    return new UserEntity(id, name, emailVO, password, refreshToken, roleId);
  }

  static fromObject(obj: IUser): UserEntity {
    const emailVO = EmailVO.create(obj.email);
    return new UserEntity(
      obj.id,
      obj.name,
      emailVO,
      obj.password,
      obj.refreshToken,
      obj.roleId
    );
  }

  // Convert Entity to plain object (for DB insertion)
  toObject(): IUser {
    return {
      id: this.id,
      name: this._name,
      email: this._email.value,
      password: this._password,
      refreshToken: this._refreshToken,
      roleId: this.roleId,
    };
  }
}

