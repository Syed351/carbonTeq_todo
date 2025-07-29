import { z } from 'zod';

const  RegisterValidate = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required")
});

const LoginValidate = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export {
  RegisterValidate,
  LoginValidate
}