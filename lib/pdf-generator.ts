/**
 * PDF Generation utilities for KMR-EduVision
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

// Generate Test PDF
export const generateTestPDF = (data: TestPDFData): jsPDF => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Header
  if (data.schoolName) {
    pdf.setFontSize(14);
    pdf.text(data.schoolName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
  }

  // Test Title
  pdf.setFontSize(16);
  pdf.text(data.testTitle, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Test Details
  pdf.setFontSize(10);
  if (data.className) {
    pdf.text(`Class: ${data.className}`, margin, yPosition);
    yPosition += 6;
  }
  if (data.date) {
    pdf.text(`Date: ${data.date}`, margin, yPosition);
    yPosition += 6;
  }
  if (data.duration) {
    pdf.text(`Duration: ${data.duration} minutes`, margin, yPosition);
    yPosition += 6;
  }
  if (data.totalMarks) {
    pdf.text(`Total Marks: ${data.totalMarks}`, margin, yPosition);
    yPosition += 6;
  }

  // Instructions
  if (data.instructions) {
    yPosition += 4;
    pdf.setFontSize(11);
    pdf.text('Instructions:', margin, yPosition);
    yPosition += 6;
    pdf.setFontSize(9);
    const instructions = pdf.splitTextToSize(data.instructions, contentWidth - 5);
    pdf.text(instructions, margin + 5, yPosition);
    yPosition += instructions.length * 4 + 4;
  }

  // Questions
  yPosition += 4;
  pdf.setFontSize(11);
  pdf.text('Questions:', margin, yPosition);
  yPosition += 8;

  data.questions.forEach((question, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }

    // Question text
    pdf.setFontSize(10);
    pdf.setFont('', 'bold');
    const questionLabel = `Q${question.questionNumber}. (${question.marks} marks)`;
    pdf.text(questionLabel, margin, yPosition);
    yPosition += 6;

    pdf.setFont('', 'normal');
    const questionLines = pdf.splitTextToSize(question.questionText, contentWidth - 5);
    pdf.text(questionLines, margin + 5, yPosition);
    yPosition += questionLines.length * 4 + 3;

    // Options (for MCQ)
    if (question.options && question.options.length > 0) {
      pdf.setFontSize(9);
      question.options.forEach((option) => {
        const optionText = `${option.letter}) ${option.text}`;
        const optionLines = pdf.splitTextToSize(optionText, contentWidth - 15);
        pdf.text(optionLines, margin + 10, yPosition);
        yPosition += optionLines.length * 3 + 2;

        // Show correct answer if requested
        if (question.showAnswer && option.isCorrect) {
          pdf.setTextColor(0, 128, 0); // Green
          pdf.text('✓ (Correct)', margin + contentWidth - 30, yPosition - 3);
          pdf.setTextColor(0, 0, 0); // Black
        }
      });
    }

    // Space for answer
    yPosition += 8;
    if (question.type === 'SHORT_ANSWER' || question.type === 'ESSAY') {
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
    }

    yPosition += 2;
  });

  return pdf;
};

// Generate Answer Key PDF
export const generateAnswerKeyPDF = (data: TestPDFData): jsPDF => {
  const pdfData = {
    ...data,
    questions: data.questions.map((q) => ({
      ...q,
      showAnswer: true,
    })),
  };
  return generateTestPDF(pdfData);
};

// Generate Report PDF
export const generateReportPDF = (reportData: {
  studentName: string;
  className: string;
  testName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  feedback?: string;
  detailedResults: Array<{
    questionNumber: number;
    questionText: string;
    marks: number;
    obtainedMarks: number;
    studentAnswer: string;
    correctAnswer: string;
  }>;
  schoolName?: string;
}): jsPDF => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Header
  if (reportData.schoolName) {
    pdf.setFontSize(14);
    pdf.text(reportData.schoolName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
  }

  pdf.setFontSize(12);
  pdf.text('Student Performance Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Student and Test Information
  pdf.setFontSize(10);
  pdf.text(`Student: ${reportData.studentName}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Class: ${reportData.className}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Test: ${reportData.testName}`, margin, yPosition);
  yPosition += 8;

  // Results Summary
  pdf.setFont('', 'bold');
  pdf.text('Results Summary', margin, yPosition);
  yPosition += 6;
  pdf.setFont('', 'normal');
  pdf.text(`Total Marks: ${reportData.totalMarks}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Obtained Marks: ${reportData.obtainedMarks}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Percentage: ${reportData.percentage}%`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Grade: ${reportData.grade}`, margin, yPosition);
  yPosition += 8;

  // Feedback
  if (reportData.feedback) {
    pdf.setFont('', 'bold');
    pdf.text('Feedback:', margin, yPosition);
    yPosition += 6;
    pdf.setFont('', 'normal');
    const feedbackLines = pdf.splitTextToSize(reportData.feedback, contentWidth - 5);
    pdf.text(feedbackLines, margin + 5, yPosition);
    yPosition += feedbackLines.length * 4 + 4;
  }

  return pdf;
};
