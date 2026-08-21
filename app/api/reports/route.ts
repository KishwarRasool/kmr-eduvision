import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

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

    const [totalEbooks, totalTests, totalStudents, submissions, grades] =
      await Promise.all([
        prisma.ebook.count({ where: { teacherId: user.id } }),
        prisma.test.count({ where: { teacherId: user.id } }),
        prisma.user.count({
          where: {
            role: 'STUDENT',
            ...(user.school ? { school: user.school } : {}),
          },
        }),
        prisma.testAssignment.count({
          where: { test: { teacherId: user.id } },
        }),
        prisma.grade.findMany({
          where: { test: { teacherId: user.id } },
          select: { percentage: true },
        }),
      ]);

    const gradedSubmissions = grades.length;
    const averageScore =
      gradedSubmissions > 0
        ? Math.round(
            grades.reduce((sum, g) => sum + g.percentage, 0) / gradedSubmissions
          )
        : 0;

    return NextResponse.json({
      stats: {
        totalEbooks,
        totalTests,
        totalStudents,
        totalSubmissions: submissions,
        gradedSubmissions,
        averageScore,
      },
    });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
