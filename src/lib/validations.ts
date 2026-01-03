import { z } from 'zod';

// Phone number validation for Indian numbers
const phoneRegex = /^[6-9]\d{9}$/;

// Authentication schemas - Phone based
export const signUpSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\u0900-\u097F]+$/, 'Name can only contain letters and spaces'),
  phone: z.string()
    .trim()
    .regex(phoneRegex, 'Please enter a valid 10-digit Indian phone number'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters')
});

export const signInSchema = z.object({
  phone: z.string()
    .trim()
    .regex(phoneRegex, 'Please enter a valid 10-digit Indian phone number'),
  password: z.string()
    .min(1, 'Password is required')
});

// Post creation schemas
export const postJobSchema = z.object({
  title: z.string()
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  location: z.string()
    .trim()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters'),
  rate: z.string()
    .trim()
    .max(50, 'Rate must be less than 50 characters'),
  phone: z.string()
    .trim()
    .regex(/^[+]?[\d\s\-()]{10,15}$/, 'Please enter a valid phone number')
    .max(15, 'Phone number must be less than 15 characters'),
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
});

export const postServiceSchema = z.object({
  skill: z.string()
    .trim()
    .min(2, 'Skill must be at least 2 characters')
    .max(100, 'Skill must be less than 100 characters'),
  experience: z.string()
    .trim()
    .min(1, 'Experience is required')
    .max(50, 'Experience must be less than 50 characters'),
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  location: z.string()
    .trim()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters'),
  rate: z.string()
    .trim()
    .max(50, 'Rate must be less than 50 characters'),
  phone: z.string()
    .trim()
    .regex(/^[+]?[\d\s\-()]{10,15}$/, 'Please enter a valid phone number')
    .max(15, 'Phone number must be less than 15 characters'),
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
});

// Message schema
export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters')
});

// Profile schema
export const profileSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z.string()
    .trim()
    .regex(/^[+]?[\d\s\-()]{10,15}$/, 'Please enter a valid phone number')
    .max(15, 'Phone number must be less than 15 characters')
    .optional(),
  location: z.string()
    .trim()
    .max(100, 'Location must be less than 100 characters')
    .optional()
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PostJobInput = z.infer<typeof postJobSchema>;
export type PostServiceInput = z.infer<typeof postServiceSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
