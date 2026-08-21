/**
 * Question generation from text content
 * - Uses OpenAI if OPENAI_API_KEY is set
 * - Falls back to rule-based generation otherwise
 */

export interface GeneratedQuestion {
  questionText: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  correctAnswer?: string;
  options?: { letter: string; text: string; isCorrect: boolean }[];
  explanation?: string;
}

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 300 && /[a-zA-Z]/.test(s));
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function makeMCQFromSentence(sentence: string, allSentences: string[]): GeneratedQuestion | null {
  // Find a meaningful word/phrase to blank out
  const words = sentence.split(/\s+/).filter((w) => w.length > 4);
  if (words.length < 3) return null;

  const target = words[Math.floor(words.length / 2)].replace(/[^a-zA-Z0-9]/g, '');
  if (target.length < 3) return null;

  const questionText = sentence.replace(
    new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    '______'
  );

  // Distractors from other sentences
  const otherWords = allSentences
    .join(' ')
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((w) => w.length > 3 && w.toLowerCase() !== target.toLowerCase());

  const unique = [...new Set(otherWords)];
  const distractors = pickRandom(unique, 3);

  while (distractors.length < 3) {
    distractors.push(`Option${distractors.length + 1}`);
  }

  const options = [
    { letter: 'A', text: target, isCorrect: true },
    { letter: 'B', text: distractors[0], isCorrect: false },
    { letter: 'C', text: distractors[1], isCorrect: false },
    { letter: 'D', text: distractors[2], isCorrect: false },
  ].sort(() => Math.random() - 0.5);

  // Re-letter after shuffle
  const letters = ['A', 'B', 'C', 'D'];
  options.forEach((o, i) => {
    o.letter = letters[i];
  });

  return {
    questionText: `Fill in the blank: ${questionText}`,
    type: 'MCQ',
    difficulty: 'MEDIUM',
    marks: 1,
    correctAnswer: target,
    options,
    explanation: `The correct word is "${target}".`,
  };
}

function makeTrueFalse(sentence: string): GeneratedQuestion {
  const isTrue = Math.random() > 0.4;
  let statement = sentence;

  if (!isTrue) {
    // Negate or alter slightly
    if (/\bis\b/i.test(sentence)) {
      statement = sentence.replace(/\bis\b/i, 'is not');
    } else if (/\bare\b/i.test(sentence)) {
      statement = sentence.replace(/\bare\b/i, 'are not');
    } else {
      statement = sentence + ' (This statement is intentionally altered.)';
    }
  }

  return {
    questionText: statement,
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    marks: 1,
    correctAnswer: isTrue ? 'True' : 'False',
    explanation: isTrue
      ? 'This statement matches the source text.'
      : 'This statement was altered from the source text.',
  };
}

function makeShortAnswer(sentence: string): GeneratedQuestion {
  const words = sentence.split(/\s+/);
  const keyPhrase = words.slice(0, Math.min(6, words.length)).join(' ');

  return {
    questionText: `Based on the text, briefly explain: "${sentence.substring(0, 120)}${sentence.length > 120 ? '...' : ''}"`,
    type: 'SHORT_ANSWER',
    difficulty: 'MEDIUM',
    marks: 2,
    correctAnswer: keyPhrase,
    explanation: 'Answer should reflect understanding of the given content.',
  };
}

function makeEssay(sentences: string[]): GeneratedQuestion {
  const topic = sentences[0]?.substring(0, 80) || 'the given topic';
  return {
    questionText: `Write a short essay (80–150 words) explaining the main ideas related to: "${topic}${topic.length >= 80 ? '...' : ''}"`,
    type: 'ESSAY',
    difficulty: 'HARD',
    marks: 5,
    correctAnswer: sentences.slice(0, 3).join(' '),
    explanation: 'Evaluate based on relevance, clarity, and understanding of the source material.',
  };
}

/** Rule-based fallback generator */
export function generateQuestionsLocally(
  text: string,
  numberOfQuestions: number = 5
): GeneratedQuestion[] {
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) {
    return [
      {
        questionText: 'What is the main topic of this material?',
        type: 'SHORT_ANSWER',
        difficulty: 'EASY',
        marks: 2,
        correctAnswer: 'Refer to the uploaded content.',
      },
    ];
  }

  const selected = pickRandom(sentences, Math.min(numberOfQuestions * 2, sentences.length));
  const questions: GeneratedQuestion[] = [];
  const types: Array<'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY'> = [
    'MCQ',
    'MCQ',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'ESSAY',
  ];

  for (let i = 0; i < numberOfQuestions && i < selected.length; i++) {
    const type = types[i % types.length];
    const sentence = selected[i];

    if (type === 'MCQ') {
      const q = makeMCQFromSentence(sentence, sentences);
      if (q) questions.push(q);
      else questions.push(makeShortAnswer(sentence));
    } else if (type === 'TRUE_FALSE') {
      questions.push(makeTrueFalse(sentence));
    } else if (type === 'SHORT_ANSWER') {
      questions.push(makeShortAnswer(sentence));
    } else {
      questions.push(makeEssay(selected.slice(i, i + 3)));
    }
  }

  return questions.slice(0, numberOfQuestions);
}

/** OpenAI-powered generation (optional) */
async function generateWithOpenAI(
  text: string,
  numberOfQuestions: number
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const truncated = text.substring(0, 6000);

  const prompt = `You are an expert K-12 exam question writer. Based on the following educational text, generate exactly ${numberOfQuestions} high-quality test questions.

Return ONLY a valid JSON array. Each item must have:
- questionText (string)
- type: one of "MCQ", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"
- difficulty: one of "EASY", "MEDIUM", "HARD"
- marks (number)
- correctAnswer (string)
- options (for MCQ only): array of { letter: "A"|"B"|"C"|"D", text: string, isCorrect: boolean }
- explanation (string)

Mix question types. Make MCQs have exactly 4 options with one correct.

TEXT:
${truncated}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You output only valid JSON arrays. No markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '[]';
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) throw new Error('Invalid AI response format');

  return parsed.map((q: any) => ({
    questionText: q.questionText,
    type: q.type || 'MCQ',
    difficulty: q.difficulty || 'MEDIUM',
    marks: q.marks || 1,
    correctAnswer: q.correctAnswer,
    options: q.options,
    explanation: q.explanation,
  }));
}

/**
 * Main entry: tries OpenAI first if key exists, else local generator
 */
export async function generateQuestionsFromText(
  text: string,
  numberOfQuestions: number = 5
): Promise<{ questions: GeneratedQuestion[]; source: 'openai' | 'local' }> {
  if (!text || text.trim().length < 50) {
    return {
      questions: generateQuestionsLocally(
        'This is sample educational content about general knowledge and learning.',
        numberOfQuestions
      ),
      source: 'local',
    };
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const questions = await generateWithOpenAI(text, numberOfQuestions);
      return { questions, source: 'openai' };
    } catch (err) {
      console.warn('OpenAI generation failed, using local fallback:', err);
    }
  }

  return {
    questions: generateQuestionsLocally(text, numberOfQuestions),
    source: 'local',
  };
}
