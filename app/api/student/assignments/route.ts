import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET - Student's own assigned tests
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

    const assignments = await prisma.testAssignment.findMany({
      where: { studentId: user.id },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            description: true,
            totalMarks: true,
            duration: true,
            status: true,
            _count: { select: { questions: true } },
          },
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

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Student assignments error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
