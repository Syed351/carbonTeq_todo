import { z } from 'zod';

export const  RegisterDTO = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required")
});

export const LoginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export type RegisterInput = z.infer<typeof RegisterDTO>;
export type LoginInput = z.infer<typeof LoginDTO>;
