import { z } from 'zod';

const clientDeviceSchema = {
  deviceId: z.string().max(64).optional(),
  deviceName: z.string().max(120).optional(),
  platform: z.string().max(32).optional(),
  appVersion: z.string().max(32).optional(),
};

/** bcrypt cost grows with length; cap to mitigate DoS. */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

export const registerSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: passwordSchema,
  ...clientDeviceSchema,
});

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required').max(128),
  ...clientDeviceSchema,
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google idToken is required'),
  ...clientDeviceSchema,
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
  newPassword: passwordSchema,
});

export const deleteAccountSchema = z
  .object({
    confirmation: z.literal('DELETE'),
    password: z.string().min(1).max(128).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== undefined && data.password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must be at least 8 characters',
        path: ['password'],
      });
    }
  });
