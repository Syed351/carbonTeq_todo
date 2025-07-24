interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  roleId: string;
  refreshToken: string;
}

interface IUserWithRole {
  id: string;
  name: string;
  email: string;
  role: string;
}
interface IUserWithRefreshToken {
  id: string;
  name: string;
  email: string;
  roleId: string;
  refreshToken: string;
}
interface IUserLogin {
  email: string;
  password: string;
}
interface IUserRegister {
  name: string;
  email: string;
  password: string;
  role: string;
}
interface IUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export {
  IUser,
  IUserWithRole,
  IUserWithRefreshToken,
  IUserLogin,
  IUserRegister,
  IUserResponse
}