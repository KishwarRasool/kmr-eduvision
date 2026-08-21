import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { calculatePercentage, getGrade } from '@/lib/utils';

// POST - Student submits test answers
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

    const { assignmentId, answers } = await req.json();
    // answers: { [questionId]: { selectedOption?: string, answerText?: string } }

    if (!assignmentId || !answers) {
      return NextResponse.json(
        { message: 'assignmentId and answers are required' },
        { status: 400 }
      );
    }

    const assignment = await prisma.testAssignment.findFirst({
      where: { id: assignmentId, studentId: user.id },
      include: {
        test: {
          include: {
            questions: { include: { options: true } },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.status === 'GRADED' || assignment.status === 'SUBMITTED') {
      return NextResponse.json(
        { message: 'Test already submitted' },
        { status: 400 }
      );
    }

    // Save responses and auto-grade objective questions
    let obtainedMarks = 0;
    const totalMarks = assignment.test.totalMarks;
    let allObjective = true;

    for (const question of assignment.test.questions) {
      const ans = answers[question.id] || {};
      let marksObtained = 0;
      let isCorrect: boolean | null = null;

      if (question.type === 'MCQ') {
        const correct = question.options.find((o) => o.isCorrect);
        if (correct && ans.selectedOption === correct.optionLetter) {
          marksObtained = question.marks;
          isCorrect = true;
        } else {
          isCorrect = false;
        }
      } else if (question.type === 'TRUE_FALSE') {
        if (
          ans.answerText &&
          question.correctAnswer &&
          ans.answerText.toLowerCase() === question.correctAnswer.toLowerCase()
        ) {
          marksObtained = question.marks;
          isCorrect = true;
        } else {
          isCorrect = false;
        }
      } else {
        // Subjective — needs manual grading
        allObjective = false;
      }

      obtainedMarks += marksObtained;

      // Upsert response
      const existing = await prisma.studentResponse.findFirst({
        where: {
          testAssignmentId: assignmentId,
          questionId: question.id,
        },
      });

      if (existing) {
        await prisma.studentResponse.update({
          where: { id: existing.id },
          data: {
            answerText: ans.answerText || null,
            selectedOption: ans.selectedOption || null,
            marksObtained,
            isCorrect,
            submittedAt: new Date(),
          },
        });
      } else {
        await prisma.studentResponse.create({
          data: {
            testAssignmentId: assignmentId,
            questionId: question.id,
            answerText: ans.answerText || null,
            selectedOption: ans.selectedOption || null,
            marksObtained,
            isCorrect,
          },
        });
      }
    }

    // Update assignment status
    const newStatus = allObjective ? 'GRADED' : 'SUBMITTED';
    await prisma.testAssignment.update({
      where: { id: assignmentId },
      data: {
        status: newStatus,
        submittedAt: new Date(),
      },
    });

    // If all objective, create grade automatically
    if (allObjective) {
      const percentage = calculatePercentage(obtainedMarks, totalMarks);
      const gradeLetter = getGrade(percentage);

      await prisma.grade.upsert({
        where: { testAssignmentId: assignmentId },
        create: {
          testAssignmentId: assignmentId,
          testId: assignment.testId,
          studentId: user.id,
          graderId: user.id, // auto-graded
          totalMarks,
          obtainedMarks,
          percentage,
          grade: gradeLetter,
          gradedAt: new Date(),
        },
        update: {
          obtainedMarks,
          percentage,
          grade: gradeLetter,
          gradedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Test submitted successfully',
      status: newStatus,
      obtainedMarks: allObjective ? obtainedMarks : undefined,
      totalMarks,
    });
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
