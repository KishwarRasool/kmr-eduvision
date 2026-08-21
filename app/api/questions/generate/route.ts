import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateQuestionsFromText } from '@/lib/question-generator';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || user.role === 'STUDENT') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ebookId, text, numberOfQuestions = 5 } = body;

    let content = text || '';

    if (ebookId) {
      const ebook = await prisma.ebook.findFirst({
        where: { id: ebookId, teacherId: user.id },
      });
      if (!ebook) {
        return NextResponse.json({ message: 'Ebook not found' }, { status: 404 });
      }
      content = ebook.textContent || content;
    }

    if (!content || content.trim().length < 30) {
      return NextResponse.json(
        {
          message:
            'Not enough text content. Upload an ebook with extractable text, or paste text manually.',
        },
        { status: 400 }
      );
    }

    const count = Math.min(Math.max(Number(numberOfQuestions) || 5, 1), 20);
    const result = await generateQuestionsFromText(content, count);

    return NextResponse.json({
      questions: result.questions,
      source: result.source,
      message:
        result.source === 'openai'
          ? 'Questions generated with AI'
          : 'Questions generated from content (local engine)',
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    return NextResponse.json(
      { message: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
