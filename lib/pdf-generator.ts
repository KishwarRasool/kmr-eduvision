/**
 * Professional PDF Generation for KMR-EduVision tests & reports
 */

import jsPDF from 'jspdf';

interface TestPDFData {
  testTitle: string;
  className?: string;
  date?: string;
  duration?: number;
  totalMarks?: number;
  instructions?: string;
  questions: Array<{
    questionNumber: number;
    questionText: string;
    type: string;
    marks: number;
    options?: Array<{
      letter: string;
      text: string;
      isCorrect?: boolean;
    }>;
    correctAnswer?: string;
    showAnswer?: boolean;
  }>;
  schoolName?: string;
  includeAnswerKey?: boolean;
}

const COLORS = {
  primary: [30, 64, 175] as [number, number, number],
  dark: [31, 41, 55] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  border: [209, 213, 219] as [number, number, number],
};

function drawHeaderBar(pdf: jsPDF, pageWidth: number) {
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, pageWidth, 8, 'F');
}

function drawFooter(pdf: jsPDF, pageWidth: number, pageHeight: number, pageNum: number, totalPages: number, schoolName?: string) {
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.3);
  pdf.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

  pdf.setFontSize(8);
  pdf.setTextColor(...COLORS.gray);
  pdf.setFont('helvetica', 'normal');
  pdf.text(schoolName || 'KMR-EduVision', 14, pageHeight - 8);
  pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  pdf.text('Confidential', pageWidth - 14, pageHeight - 8, { align: 'right' });
}

function ensureSpace(pdf: jsPDF, y: number, needed: number, pageHeight: number, margin: number): number {
  if (y + needed > pageHeight - 20) {
    pdf.addPage();
    return margin + 6;
  }
  return y;
}

export const generateTestPDF = (data: TestPDFData): jsPDF => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - 2 * margin;
  let y = 16;

  // Top accent bar
  drawHeaderBar(pdf, pageWidth);

  // School name
  if (data.schoolName) {
    y = 18;
    pdf.setFontSize(11);
    pdf.setTextColor(...COLORS.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.schoolName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 7;
  } else {
    y = 18;
  }

  // Test title
  pdf.setFontSize(16);
  pdf.setTextColor(...COLORS.dark);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(data.testTitle, contentWidth);
  pdf.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 7 + 2;

  // Decorative line under title
  pdf.setDrawColor(...COLORS.primary);
  pdf.setLineWidth(0.6);
  pdf.line(pageWidth / 2 - 30, y, pageWidth / 2 + 30, y);
  y += 8;

  // Info box
  pdf.setFillColor(...COLORS.lightGray);
  pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.dark);
  pdf.setFont('helvetica', 'normal');

  const infoY = y + 6;
  const col1 = margin + 4;
  const col2 = margin + contentWidth / 3;
  const col3 = margin + (2 * contentWidth) / 3;

  if (data.className) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Class:', col1, infoY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.className, col1 + 14, infoY);
  }
  if (data.date) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date:', col2, infoY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.date, col2 + 12, infoY);
  }
  if (data.duration) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Duration:', col3, infoY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.duration} min`, col3 + 20, infoY);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Marks:', col1, infoY + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(data.totalMarks || 100), col1 + 24, infoY + 7);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Name: ________________', col2, infoY + 7);

  y += 24;

  // Instructions
  if (data.instructions) {
    y = ensureSpace(pdf, y, 20, pageHeight, margin);
    pdf.setFillColor(239, 246, 255); // light blue
    const instrLines = pdf.splitTextToSize(data.instructions, contentWidth - 8);
    const boxH = 8 + instrLines.length * 4;
    pdf.roundedRect(margin, y, contentWidth, boxH, 2, 2, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Instructions', margin + 4, y + 5);

    pdf.setTextColor(...COLORS.dark);
    pdf.setFont('helvetica', 'normal');
    pdf.text(instrLines, margin + 4, y + 10);
    y += boxH + 6;
  }

  // Questions heading
  pdf.setFontSize(11);
  pdf.setTextColor(...COLORS.primary);
  pdf.setFont('helvetica', 'bold');
  pdf.text('QUESTIONS', margin, y);
  y += 2;
  pdf.setDrawColor(...COLORS.primary);
  pdf.setLineWidth(0.4);
  pdf.line(margin, y, margin + 28, y);
  y += 8;

  // Questions
  data.questions.forEach((question) => {
    // Estimate height needed
    const qLines = pdf.splitTextToSize(question.questionText, contentWidth - 10);
    let needed = 10 + qLines.length * 4.5;
    if (question.options?.length) needed += question.options.length * 6;
    if (question.type === 'SHORT_ANSWER') needed += 12;
    if (question.type === 'ESSAY') needed += 28;

    y = ensureSpace(pdf, y, needed, pageHeight, margin);

    // Question number badge
    pdf.setFillColor(...COLORS.primary);
    pdf.circle(margin + 4, y + 1, 3.5, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(question.questionNumber), margin + 4, y + 2.2, { align: 'center' });

    // Question text
    pdf.setFontSize(10);
    pdf.setTextColor(...COLORS.dark);
    pdf.setFont('helvetica', 'normal');
    pdf.text(qLines, margin + 10, y + 2);

    // Marks badge
    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.gray);
    pdf.setFont('helvetica', 'italic');
    const marksLabel = `[${question.marks} mark${question.marks !== 1 ? 's' : ''}]`;
    pdf.text(marksLabel, pageWidth - margin, y + 2, { align: 'right' });

    y += qLines.length * 4.5 + 4;

    // Options
    if (question.options && question.options.length > 0) {
      pdf.setFontSize(9);
      question.options.forEach((option) => {
        y = ensureSpace(pdf, y, 7, pageHeight, margin);

        if (question.showAnswer && option.isCorrect) {
          pdf.setFillColor(220, 252, 231); // light green
          pdf.roundedRect(margin + 8, y - 3, contentWidth - 10, 6, 1, 1, 'F');
          pdf.setTextColor(...COLORS.green);
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setTextColor(...COLORS.dark);
          pdf.setFont('helvetica', 'normal');
        }

        const optText = `${option.letter})  ${option.text}`;
        const optLines = pdf.splitTextToSize(optText, contentWidth - 16);
        pdf.text(optLines, margin + 12, y);
        y += optLines.length * 4.5 + 1.5;
      });
      y += 2;
    }

    // Answer lines for subjective
    if (question.type === 'SHORT_ANSWER') {
      pdf.setDrawColor(...COLORS.border);
      pdf.setLineWidth(0.3);
      pdf.line(margin + 8, y + 4, pageWidth - margin, y + 4);
      y += 10;
    }

    if (question.type === 'ESSAY') {
      pdf.setDrawColor(...COLORS.border);
      pdf.setLineWidth(0.3);
      for (let i = 0; i < 4; i++) {
        pdf.line(margin + 8, y + 4, pageWidth - margin, y + 4);
        y += 7;
      }
      y += 2;
    }

    // Correct answer note when showing key
    if (question.showAnswer && question.correctAnswer && question.type !== 'MCQ') {
      pdf.setFontSize(8);
      pdf.setTextColor(...COLORS.green);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Answer: ${question.correctAnswer}`, margin + 10, y);
      y += 5;
    }

    y += 4;
  });

  // Add footers to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    drawFooter(pdf, pageWidth, pageHeight, i, totalPages, data.schoolName);
  }

  return pdf;
};

export const generateAnswerKeyPDF = (data: TestPDFData): jsPDF => {
  return generateTestPDF({
    ...data,
    testTitle: `${data.testTitle} — Answer Key`,
    questions: data.questions.map((q) => ({ ...q, showAnswer: true })),
  });
};

export const generateReportPDF = (reportData: {
  studentName: string;
  className: string;
  testName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  feedback?: string;
  detailedResults?: Array<{
    questionNumber: number;
    questionText: string;
    marks: number;
    obtainedMarks: number;
    studentAnswer: string;
    correctAnswer: string;
  }>;
  schoolName?: string;
}): jsPDF => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  let y = 16;

  drawHeaderBar(pdf, pageWidth);

  y = 20;
  if (reportData.schoolName) {
    pdf.setFontSize(11);
    pdf.setTextColor(...COLORS.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reportData.schoolName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 8;
  }

  pdf.setFontSize(15);
  pdf.setTextColor(...COLORS.dark);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Student Performance Report', pageWidth / 2, y, { align: 'center' });
  y += 4;
  pdf.setDrawColor(...COLORS.primary);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 35, y, pageWidth / 2 + 35, y);
  y += 12;

  // Student info card
  pdf.setFillColor(...COLORS.lightGray);
  pdf.roundedRect(margin, y, pageWidth - 2 * margin, 28, 2, 2, 'F');

  pdf.setFontSize(10);
  pdf.setTextColor(...COLORS.dark);
  const infoItems = [
    ['Student', reportData.studentName],
    ['Class', reportData.className],
    ['Test', reportData.testName],
  ];
  infoItems.forEach((item, i) => {
    const iy = y + 7 + i * 7;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${item[0]}:`, margin + 5, iy);
    pdf.setFont('helvetica', 'normal');
    pdf.text(item[1], margin + 28, iy);
  });
  y += 36;

  // Results summary
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.primary);
  pdf.text('Results Summary', margin, y);
  y += 8;

  const results = [
    ['Total Marks', String(reportData.totalMarks)],
    ['Obtained Marks', String(reportData.obtainedMarks)],
    ['Percentage', `${reportData.percentage}%`],
    ['Grade', reportData.grade],
  ];

  results.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * ((pageWidth - 2 * margin) / 2);
    const ry = y + row * 10;

    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.gray);
    pdf.setFont('helvetica', 'normal');
    pdf.text(label, x, ry);

    pdf.setFontSize(12);
    pdf.setTextColor(...COLORS.dark);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, x + 40, ry);
  });
  y += 28;

  if (reportData.feedback) {
    pdf.setFontSize(10);
    pdf.setTextColor(...COLORS.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Teacher Feedback', margin, y);
    y += 6;

    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.dark);
    pdf.setFont('helvetica', 'normal');
    const fbLines = pdf.splitTextToSize(reportData.feedback, pageWidth - 2 * margin);
    pdf.text(fbLines, margin, y);
    y += fbLines.length * 4 + 6;
  }

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    drawFooter(pdf, pageWidth, pageHeight, i, totalPages, reportData.schoolName);
  }

  return pdf;
};
