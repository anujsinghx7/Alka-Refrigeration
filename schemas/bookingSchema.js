import { z } from 'zod';

export const serviceTypes = [
  'AC Repair',
  'Fridge Repair',
  'Washing Machine Repair',
  'Deep Freezer Repair',
  'Water Cooler Repair',
];

export const bookingSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .max(60, { message: 'Name must not exceed 60 characters.' }),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit Indian mobile number.' }),
  location: z
    .string()
    .min(3, { message: 'Service location/address is required.' })
    .max(200, { message: 'Address must not exceed 200 characters.' }),
  serviceType: z.enum(
    [
      'AC Repair',
      'Fridge Repair',
      'Washing Machine Repair',
      'Deep Freezer Repair',
      'Water Cooler Repair',
    ],
    { errorMap: () => ({ message: 'Please select a valid service.' }) }
  ),
  preferredDate: z
    .string()
    .min(1, { message: 'Preferred date is required.' })
    .refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format.' }),
  preferredTime: z.string().default('Anytime'),
  instructions: z.string().max(500, { message: 'Special instructions must be under 500 characters.' }).optional().default(''),
});
