import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// GET - List students (same school as teacher, or all students)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        ...(user.school ? { school: user.school } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        school: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('List students error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a new student
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!teacher) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: 'STUDENT',
        school: teacher.school || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        school: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: 'Student added', student },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add student error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
