import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET - Get assignment details for taking the test (no correct answers)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const assignment = await prisma.testAssignment.findFirst({
      where: { id: params.id, studentId: user.id },
      include: {
        test: {
          include: {
            questions: {
              include: {
                options: {
                  select: {
                    id: true,
                    optionText: true,
                    optionLetter: true,
                    // isCorrect intentionally hidden from student
                  },
                },
              },
              orderBy: { questionOrder: 'asc' },
            },
          },
        },
        grade: true,
        responses: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    // Mark as in progress if still ASSIGNED
    if (assignment.status === 'ASSIGNED') {
      await prisma.testAssignment.update({
        where: { id: assignment.id },
        data: { status: 'IN_PROGRESS', startedAt: new Date() },
      });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Get student assignment error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
