import { z } from 'zod';

export const RegisterDto = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
