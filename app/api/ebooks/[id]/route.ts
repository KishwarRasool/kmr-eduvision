import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

// GET single ebook
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

    const ebook = await prisma.ebook.findFirst({
      where: { id: params.id, teacherId: user.id },
      include: { chapters: true },
    });

    if (!ebook) {
      return NextResponse.json({ message: 'Ebook not found' }, { status: 404 });
    }

    return NextResponse.json({
      ebook: {
        ...ebook,
        fileSize: Number(ebook.fileSize),
      },
    });
  } catch (error) {
    console.error('Get ebook error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE ebook
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

    const ebook = await prisma.ebook.findFirst({
      where: { id: params.id, teacherId: user.id },
    });

    if (!ebook) {
      return NextResponse.json({ message: 'Ebook not found' }, { status: 404 });
    }

    // Try to delete the physical file
    try {
      const fullPath = path.join(process.cwd(), 'public', ebook.filePath);
      await unlink(fullPath);
    } catch {
      // File may not exist, ignore
    }

    await prisma.ebook.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Ebook deleted successfully' });
  } catch (error) {
    console.error('Delete ebook error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
