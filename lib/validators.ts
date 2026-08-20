/**
 * Input validation schemas using Zod
 */

import { z } from 'zod';

// User registration schema
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  school: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// User login schema
export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Test creation schema
export const testCreationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  ebookId: z.string().optional(),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  passingMarks: z.number().min(0, 'Passing marks cannot be negative'),
  duration: z.number().optional(),
});

// Question creation schema
export const questionCreationSchema = z.object({
  testId: z.string().min(1, 'Test ID is required'),
  questionText: z.string().min(5, 'Question must be at least 5 characters'),
  type: z.enum(['MCQ', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE', 'FILL_BLANKS']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  marks: z.number().min(1, 'Marks must be at least 1'),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  options: z.array(z.object({
    text: z.string(),
    isCorrect: z.boolean(),
  })).optional(),
});

// Ebook upload schema
export const ebookUploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  fileName: z.string(),
  fileType: z.enum(['PDF', 'EPUB']),
});

// Test assignment schema
export const testAssignmentSchema = z.object({
  testId: z.string().min(1, 'Test ID is required'),
  studentIds: z.array(z.string()).min(1, 'At least one student must be selected'),
  dueDate: z.date().optional(),
});

// Student response schema
export const studentResponseSchema = z.object({
  testAssignmentId: z.string().min(1, 'Assignment ID is required'),
  answers: z.array(z.object({
    questionId: z.string(),
    answerText: z.string().optional(),
    selectedOption: z.string().optional(),
  })),
});

// Grading schema
export const gradingSchema = z.object({
  testAssignmentId: z.string().min(1, 'Assignment ID is required'),
  marks: z.number().min(0, 'Marks cannot be negative'),
  feedback: z.string().optional(),
});
