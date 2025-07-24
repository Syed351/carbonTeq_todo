import { z } from 'zod';
import { Result } from '@carbonteq/fp';
import { IUserLogin } from '../interface/user.interface';

const  RegisterDTO = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required")
});

const LoginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const validateLoginDTO = (
  input: IUserLogin
): Result<IUserLogin, string> => {
  const result = LoginDTO.safeParse(input);
  return result.success
    ? Result.Ok(result.data)
    : Result.Err("Invalid login credentials");
};
export type RegisterInput = z.infer<typeof RegisterDTO>;
export type LoginInput = z.infer<typeof LoginDTO>;

export {
  RegisterDTO,
  LoginDTO
}