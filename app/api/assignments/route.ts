import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET - List assignments for teacher's tests
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
      where: { test: { teacherId: user.id } },
      include: {
        test: { select: { id: true, title: true } },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('List assignments error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST - Assign a test to one or more students
export async function POST(req: NextRequest) {
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

    const { testId, studentIds, dueDate } = await req.json();

    if (!testId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { message: 'testId and studentIds are required' },
        { status: 400 }
      );
    }

    // Verify the test belongs to this teacher
    const test = await prisma.test.findFirst({
      where: { id: testId, teacherId: user.id },
    });
    if (!test) {
      return NextResponse.json({ message: 'Test not found' }, { status: 404 });
    }

    // Create assignments (skip if already assigned)
    const created = [];
    for (const studentId of studentIds) {
      try {
        const assignment = await prisma.testAssignment.create({
          data: {
            testId,
            studentId,
            dueDate: dueDate ? new Date(dueDate) : null,
            status: 'ASSIGNED',
          },
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        });
        created.push(assignment);
      } catch {
        // Unique constraint — already assigned, skip
      }
    }

    return NextResponse.json(
      {
        message: `Assigned to ${created.length} student(s)`,
        assignments: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Assign test error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
