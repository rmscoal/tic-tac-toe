import { z } from 'zod';

const SignupRequest = z.object({
  username: z
    .string()
    .min(5)
    .refine((value) => !value.includes(' '), { message: 'username must not contained any space' }),
  password: z.string().min(8),
});

export { SignupRequest };

const LoginRequest = z.object({
  username: z.string(),
  password: z.string(),
});

export { LoginRequest };
