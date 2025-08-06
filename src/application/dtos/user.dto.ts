interface IUser{
  id:string,
  name:string,
  email:string,
  role:string
}
interface IUserWithRoleDTO {
  id: string;
  name: string;
  email: string;
  role: string;
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
  IUser,
  IUserWithRoleDTO,
  IUserLoginDTO,
  IUserRegisterDTO,
  IUserResponseDTO
}