import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET - List teacher's tests
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

    const tests = await prisma.test.findMany({
      where: { teacherId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json({ tests });
  } catch (error) {
    console.error('List tests error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new test with questions
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

    const body = await req.json();
    const {
      title,
      description,
      instructions,
      totalMarks,
      passingMarks,
      duration,
      ebookId,
      questions,
    } = body;

    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    const test = await prisma.test.create({
      data: {
        teacherId: user.id,
        title,
        description: description || null,
        instructions: instructions || null,
        totalMarks: totalMarks || 100,
        passingMarks: passingMarks || 40,
        duration: duration || null,
        ebookId: ebookId || null,
        status: 'DRAFT',
        questions: {
          create: (questions || []).map((q: any, index: number) => ({
            teacherId: user.id,
            ebookId: ebookId || null,
            questionText: q.questionText,
            type: q.type || 'MCQ',
            difficulty: q.difficulty || 'MEDIUM',
            marks: q.marks || 1,
            correctAnswer: q.correctAnswer || null,
            questionOrder: q.questionOrder || index + 1,
            options: q.options
              ? {
                  create: q.options.map((o: any) => ({
                    optionText: o.text,
                    optionLetter: o.letter,
                    isCorrect: o.isCorrect || false,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        questions: { include: { options: true } },
      },
    });

    return NextResponse.json(
      { message: 'Test created successfully', test },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create test error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
