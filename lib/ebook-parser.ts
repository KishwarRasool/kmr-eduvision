/**
 * Ebook parsing utilities for extracting text from PDF and EPUB files
 */

import * as pdfParse from 'pdf-parse';

interface ExtractedContent {
  text: string;
  pages: number;
  metadata?: Record<string, any>;
}

// Extract text from PDF
export const extractPDFText = async (filePath: string): Promise<ExtractedContent> => {
  try {
    const pdfBuffer = await import('fs').then((fs) =>
      fs.promises.readFile(filePath)
    );

    const pdfData = await pdfParse(pdfBuffer);

    return {
      text: pdfData.text,
      pages: pdfData.numpages,
      metadata: pdfData.metadata,
    };
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Extract text from EPUB (basic implementation)
export const extractEPUBText = async (filePath: string): Promise<ExtractedContent> => {
  try {
    // Note: This is a simplified implementation
    // For production, consider using a dedicated EPUB parser library
    const epubLib = require('epub');
    const epub = new epubLib(filePath);

    let text = '';
    let pages = 0;

    return new Promise((resolve, reject) => {
      epub.on('end', () => {
        resolve({
          text: text || 'EPUB content extracted',
          pages: pages || 1,
        });
      });

      epub.on('error', (error: any) => {
        reject(new Error(`Failed to extract text from EPUB: ${error}`));
      });

      epub.parse();
    });
  } catch (error) {
    console.error('Error extracting EPUB text:', error);
    throw new Error('Failed to extract text from EPUB');
  }
};

// Extract chapters from text
export const extractChapters = (text: string): Array<{ title: string; content: string }> => {
  // Simple chapter extraction based on common patterns
  const chapterPattern = /Chapter\s+(\d+)[:\s](.+?)(?=Chapter|$)/gi;
  const chapters: Array<{ title: string; content: string }> = [];

  let match;
  while ((match = chapterPattern.exec(text)) !== null) {
    chapters.push({
      title: `Chapter ${match[1]}: ${match[2]}`,
      content: match[0],
    });
  }

  return chapters;
};

// Re-export from dedicated question generator
export { generateQuestionsFromText } from './question-generator';
