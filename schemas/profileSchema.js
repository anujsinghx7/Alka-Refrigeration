import { z } from 'zod';

export const profileSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit mobile number' })
    .or(z.literal(''))
    .optional(),
  location: z
    .string()
    .max(200, { message: 'Location cannot exceed 200 characters' })
    .optional(),
});
