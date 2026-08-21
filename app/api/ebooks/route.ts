import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { extractPDFText } from '@/lib/ebook-parser';

// GET - List teacher's ebooks
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

    const ebooks = await prisma.ebook.findMany({
      where: { teacherId: user.id },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        pages: true,
        uploadedAt: true,
      },
    });

    // Convert BigInt to number for JSON
    const serialized = ebooks.map((e) => ({
      ...e,
      fileSize: Number(e.fileSize),
    }));

    return NextResponse.json({ ebooks: serialized });
  } catch (error) {
    console.error('List ebooks error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Upload new ebook
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

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;

    if (!title || !file) {
      return NextResponse.json(
        { message: 'Title and file are required' },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileType = fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'EPUB';
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    // Extract text from PDF (simplified for now)
    let textContent = '';
    let pages = 0;
    if (fileType === 'PDF') {
      try {
        const extracted = await extractPDFText(filePath);
        textContent = extracted.text?.substring(0, 50000) || ''; // Limit size
        pages = extracted.pages || 0;
      } catch (err) {
        console.warn('Text extraction failed, continuing without it:', err);
      }
    }

    const ebook = await prisma.ebook.create({
      data: {
        teacherId: user.id,
        title,
        description: description || null,
        fileName,
        fileType,
        filePath: `/uploads/${uniqueName}`,
        fileSize: BigInt(file.size),
        pages: pages || null,
        textContent: textContent || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Ebook uploaded successfully',
        ebook: {
          id: ebook.id,
          title: ebook.title,
          fileName: ebook.fileName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload ebook error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
