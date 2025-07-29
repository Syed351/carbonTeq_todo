interface IUserDTO {
  id: string;
  name: string;
  email: string;
  password: string;
  roleId: string;
  refreshToken: string;
}

interface IUserWithRoleDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}
interface IUserWithRefreshTokenDTO {
  id: string;
  name: string;
  email: string;
  roleId: string;
  refreshToken: string;
}
interface IUserLoginDTO {
  email: string;
  password: string;
}
interface IUserRegisterDTO {
  name: string;
  email: string;
  password: string;
  role: string;
}
interface IUserResponseDTO {
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
  IUserDTO,
  IUserWithRoleDTO,
  // IUserWithRefreshTokenDTO,
  IUserLoginDTO,
  IUserRegisterDTO,
  IUserResponseDTO
}