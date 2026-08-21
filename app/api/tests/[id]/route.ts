import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET single test with questions
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

    return NextResponse.json({ test });
  } catch (error) {
    console.error('Get test error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update test
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

    const existing = await prisma.test.findFirst({
      where: { id: params.id, teacherId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ message: 'Test not found' }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, instructions, totalMarks, passingMarks, duration, status } = body;

    const test = await prisma.test.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(totalMarks !== undefined && { totalMarks }),
        ...(passingMarks !== undefined && { passingMarks }),
        ...(duration !== undefined && { duration }),
        ...(status !== undefined && { status }),
      },
      include: {
        questions: { include: { options: true } },
      },
    });

    return NextResponse.json({ message: 'Test updated', test });
  } catch (error) {
    console.error('Update test error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE test
export async function DELETE(
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

    const existing = await prisma.test.findFirst({
      where: { id: params.id, teacherId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ message: 'Test not found' }, { status: 404 });
    }

    await prisma.test.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Test deleted' });
  } catch (error) {
    console.error('Delete test error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
