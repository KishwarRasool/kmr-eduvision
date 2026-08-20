import bcrypt from 'bcryptjs';
import { prisma } from './db';

/**
 * Authentication utilities for KMR-EduVision
 */

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Verify password
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Get user by email
export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// Get user by ID
export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

// Create user
export const createUser = async (data: {
  email: string;
  password: string;
  name: string;
  role: 'TEACHER' | 'STUDENT' | 'ADMIN';
  school?: string;
}) => {
  const hashedPassword = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
};

// Update user
export const updateUser = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    school?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
  }
) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

// Change password
export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<boolean> => {
  const user = await getUserById(userId);
  if (!user) return false;

  const isPasswordValid = await verifyPassword(oldPassword, user.password);
  if (!isPasswordValid) return false;

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return true;
};
