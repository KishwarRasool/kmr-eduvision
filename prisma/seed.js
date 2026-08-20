const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.studentResponse.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.testAssignment.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.test.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.ebook.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Mr. Ahmed Khan',
      role: 'TEACHER',
      school: 'Punjab Model School',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Ali Hassan',
      role: 'STUDENT',
      school: 'Punjab Model School',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Fatima Ali',
      role: 'STUDENT',
      school: 'Punjab Model School',
    },
  });

  // Create sample ebook
  const ebook = await prisma.ebook.create({
    data: {
      teacherId: teacher.id,
      title: 'Mathematics Grade 10 - Punjab Curriculum',
      description: 'Complete Mathematics textbook for Grade 10',
      fileName: 'math-grade-10.pdf',
      fileType: 'PDF',
      filePath: '/uploads/math-grade-10.pdf',
      fileSize: 5242880n,
      pages: 250,
      textContent: 'Sample content extracted from PDF...',
    },
  });

  // Create sample test
  const test = await prisma.test.create({
    data: {
      teacherId: teacher.id,
      ebookId: ebook.id,
      title: 'Mathematics Midterm Exam',
      description: 'Midterm examination for Grade 10 Mathematics',
      instructions: 'Answer all questions. Show your work.',
      totalMarks: 100,
      passingMarks: 40,
      duration: 120,
      status: 'PUBLISHED',
    },
  });

  // Create sample questions
  const mcqQuestion = await prisma.question.create({
    data: {
      testId: test.id,
      teacherId: teacher.id,
      ebookId: ebook.id,
      questionText: 'What is the square root of 144?',
      type: 'MCQ',
      difficulty: 'EASY',
      marks: 1,
      correctAnswer: 'B',
      explanation: 'The square root of 144 is 12.',
      questionOrder: 1,
      options: {
        create: [
          { optionText: '10', optionLetter: 'A', isCorrect: false },
          { optionText: '12', optionLetter: 'B', isCorrect: true },
          { optionText: '14', optionLetter: 'C', isCorrect: false },
          { optionText: '16', optionLetter: 'D', isCorrect: false },
        ],
      },
    },
    include: { options: true },
  });

  const shortAnswerQuestion = await prisma.question.create({
    data: {
      testId: test.id,
      teacherId: teacher.id,
      ebookId: ebook.id,
      questionText: 'Explain the Pythagorean theorem.',
      type: 'SHORT_ANSWER',
      difficulty: 'MEDIUM',
      marks: 5,
      correctAnswer: 'a² + b² = c²',
      explanation: 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.',
      questionOrder: 2,
    },
  });

  // Create test assignments
  const assignment1 = await prisma.testAssignment.create({
    data: {
      testId: test.id,
      studentId: student1.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'ASSIGNED',
    },
  });

  const assignment2 = await prisma.testAssignment.create({
    data: {
      testId: test.id,
      studentId: student2.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });

  // Create sample responses
  await prisma.studentResponse.create({
    data: {
      testAssignmentId: assignment2.id,
      questionId: mcqQuestion.id,
      selectedOption: 'B',
      marksObtained: 1,
      isCorrect: true,
    },
  });

  await prisma.studentResponse.create({
    data: {
      testAssignmentId: assignment2.id,
      questionId: shortAnswerQuestion.id,
      answerText: 'a² + b² = c² in right triangles',
      marksObtained: 0, // Will be graded manually
    },
  });

  // Create sample grade
  await prisma.grade.create({
    data: {
      testAssignmentId: assignment2.id,
      testId: test.id,
      studentId: student2.id,
      graderId: teacher.id,
      totalMarks: 100,
      obtainedMarks: 85,
      percentage: 85,
      grade: 'A',
      feedback: 'Excellent work!',
      gradedAt: new Date(),
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Sample Users Created:');
  console.log(`- Teacher: ${teacher.email}`);
  console.log(`- Student 1: ${student1.email}`);
  console.log(`- Student 2: ${student2.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
