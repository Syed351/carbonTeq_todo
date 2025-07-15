export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  roleId: string;
  refreshToken: string;
}

export interface IUserWithRole {
  id: string;
  name: string;
  email: string;
  role: string;
}
export interface IUserWithRefreshToken {
  id: string;
  name: string;
  email: string;
  roleId: string;
  refreshToken: string;
}
export interface IUserLogin {
  email: string;
  password: string;
}
export interface IUserRegister {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface IUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}
