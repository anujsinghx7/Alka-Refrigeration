import { z } from 'zod';

export const passwordComplexityRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-\[\]{}|~`])[A-Za-z\d@$!%*?&#^()_+=\-\[\]{}|~`]{8,}$/;

/**
 * Step 1: Account Registration Validation Schema
 */
export const registerStep1Schema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'First name must be at least 2 characters.' })
      .max(40, { message: 'First name must not exceed 40 characters.' })
      .trim(),
    lastName: z
      .string()
      .min(1, { message: 'Last name is required.' })
      .max(40, { message: 'Last name must not exceed 40 characters.' })
      .trim(),
    email: z
      .string()
      .email({ message: 'Please enter a valid email address.' })
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(passwordComplexityRegex, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

/**
 * Step 2: Email OTP Verification Schema
 */
export const verifyEmailOtpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }).toLowerCase().trim(),
  otp: z
    .string()
    .length(6, { message: 'Verification code must be exactly 6 digits.' })
    .regex(/^\d{6}$/, { message: 'Verification code must contain only numbers.' }),
});

/**
 * Step 3: Optional Mobile OTP Request Schema
 */
export const sendMobileOtpSchema = z.object({
  email: z.string().email(),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit Indian mobile number.' }),
});

/**
 * Step 3: Optional Mobile OTP Verification Schema
 */
export const verifyMobileOtpSchema = z.object({
  email: z.string().email(),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  otp: z
    .string()
    .length(6, { message: 'Mobile verification code must be exactly 6 digits.' })
    .regex(/^\d{6}$/),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter your registered email address.' }).toLowerCase().trim(),
  password: z.string().min(1, { message: 'Password is required.' }),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Forgot Password Request Schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter your registered email address.' }).toLowerCase().trim(),
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address.' }).toLowerCase().trim(),
    otp: z
      .string()
      .length(6, { message: 'Reset code must be exactly 6 digits.' })
      .regex(/^\d{6}$/, { message: 'Reset code must be numeric.' }),
    newPassword: z
      .string()
      .min(8, { message: 'New password must be at least 8 characters long.' })
      .regex(passwordComplexityRegex, {
        message:
          'Password must contain at least one uppercase, one lowercase, one number, and one special character.',
      }),
    confirmNewPassword: z.string().min(1, { message: 'Please confirm your new password.' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match.',
    path: ['confirmNewPassword'],
  });
