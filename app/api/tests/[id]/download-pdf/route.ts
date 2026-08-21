import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateTestPDF } from '@/lib/pdf-generator';

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

    const test = await prisma.test.findFirst({
      where: { id: params.id, teacherId: user.id },
      include: {
        questions: {
          include: { options: true },
          orderBy: { questionOrder: 'asc' },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ message: 'Test not found' }, { status: 404 });
    }

    const pdf = generateTestPDF({
      testTitle: test.title,
      schoolName: user.school || undefined,
      duration: test.duration || undefined,
      totalMarks: test.totalMarks,
      instructions: test.instructions || undefined,
      questions: test.questions.map((q, i) => ({
        questionNumber: i + 1,
        questionText: q.questionText,
        type: q.type,
        marks: q.marks,
        options: q.options.map((o) => ({
          letter: o.optionLetter,
          text: o.optionText,
          isCorrect: o.isCorrect,
        })),
        correctAnswer: q.correctAnswer || undefined,
        showAnswer: false,
      })),
    });

    const buffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${test.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF download error:', error);
    return NextResponse.json(
      { message: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
