import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { calculatePercentage, getGrade } from '@/lib/utils';

// GET single submission with responses and questions
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
      where: {
        id: params.id,
        test: { teacherId: user.id },
      },
      include: {
        test: {
          include: {
            questions: {
              include: { options: true },
              orderBy: { questionOrder: 'asc' },
            },
          },
        },
        student: { select: { id: true, name: true, email: true } },
        responses: true,
        grade: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ submission: assignment });
  } catch (error) {
    console.error('Get submission error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Grade a submission
export async function PUT(
  req: NextRequest,
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
      where: {
        id: params.id,
        test: { teacherId: user.id },
      },
      include: {
        test: {
          include: {
            questions: { include: { options: true } },
          },
        },
        responses: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
    }

    const body = await req.json();
    // body.marks: { [questionId]: number }
    // body.feedback?: string
    const { marks, feedback } = body;

    let obtainedMarks = 0;

    // Update each response with marks
    for (const question of assignment.test.questions) {
      const response = assignment.responses.find(
        (r) => r.questionId === question.id
      );
      let qMarks = 0;

      if (marks && marks[question.id] !== undefined) {
        // Manual marks from teacher
        qMarks = Number(marks[question.id]) || 0;
      } else if (response) {
        // Auto-grade MCQ / True-False
        if (question.type === 'MCQ') {
          const correctOption = question.options.find((o) => o.isCorrect);
          if (
            correctOption &&
            response.selectedOption === correctOption.optionLetter
          ) {
            qMarks = question.marks;
          }
        } else if (question.type === 'TRUE_FALSE') {
          if (
            response.answerText?.toLowerCase() ===
            question.correctAnswer?.toLowerCase()
          ) {
            qMarks = question.marks;
          }
        }
      }

      obtainedMarks += qMarks;

      if (response) {
        await prisma.studentResponse.update({
          where: { id: response.id },
          data: {
            marksObtained: qMarks,
            isCorrect: qMarks === question.marks,
          },
        });
      }
    }

    const totalMarks = assignment.test.totalMarks;
    const percentage = calculatePercentage(obtainedMarks, totalMarks);
    const gradeLetter = getGrade(percentage);

    // Upsert grade
    const grade = await prisma.grade.upsert({
      where: { testAssignmentId: assignment.id },
      create: {
        testAssignmentId: assignment.id,
        testId: assignment.testId,
        studentId: assignment.studentId,
        graderId: user.id,
        totalMarks,
        obtainedMarks,
        percentage,
        grade: gradeLetter,
        feedback: feedback || null,
        gradedAt: new Date(),
      },
      update: {
        obtainedMarks,
        percentage,
        grade: gradeLetter,
        feedback: feedback || null,
        gradedAt: new Date(),
        graderId: user.id,
      },
    });

    // Update assignment status
    await prisma.testAssignment.update({
      where: { id: assignment.id },
      data: { status: 'GRADED' },
    });

    return NextResponse.json({
      message: 'Graded successfully',
      grade,
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
