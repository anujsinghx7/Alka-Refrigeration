import { z } from 'zod';

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, { message: 'Code must be at least 3 characters.' })
    .max(20, { message: 'Code cannot exceed 20 characters.' })
    .regex(/^[A-Za-z0-9_-]+$/, { message: 'Code can only contain letters, numbers, and dashes.' }),
  discountType: z.enum(['Percentage', 'Flat']).default('Percentage'),
  discountValue: z.coerce
    .number()
    .min(1, { message: 'Discount value must be at least 1.' }),
  serviceType: z
    .enum([
      'All Services',
      'AC Repair',
      'Fridge Repair',
      'Washing Machine Repair',
      'Deep Freezer Repair',
      'Water Cooler Repair',
    ])
    .default('All Services'),
  expiryDate: z
    .string()
    .min(1, { message: 'Expiry date is required.' })
    .refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid expiry date.' }),
  description: z.string().max(200).optional().default(''),
  userId: z.string().optional().nullable().default(null),
});
