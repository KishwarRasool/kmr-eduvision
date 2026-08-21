import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET - List submissions for teacher's tests
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

    const submissions = await prisma.testAssignment.findMany({
      where: {
        test: { teacherId: user.id },
      },
      include: {
        test: {
          select: { id: true, title: true, totalMarks: true },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
        grade: {
          select: {
            obtainedMarks: true,
            percentage: true,
            grade: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('List submissions error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
