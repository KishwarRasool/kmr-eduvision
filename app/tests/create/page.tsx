'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react';

interface Ebook {
  id: string;
  title: string;
}

interface QuestionDraft {
  id: string;
  questionText: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: { letter: string; text: string; isCorrect: boolean }[];
  correctAnswer: string;
}

export default function CreateTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [duration, setDuration] = useState(60);
  const [ebookId, setEbookId] = useState('');
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [genCount, setGenCount] = useState(5);

  useEffect(() => {
    fetch('/api/ebooks')
      .then((r) => r.json())
      .then((d) => setEbooks(d.ebooks || []))
      .catch(console.error);
  }, []);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        questionText: '',
        type: 'MCQ',
        marks: 1,
        difficulty: 'MEDIUM',
        options: [
          { letter: 'A', text: '', isCorrect: false },
          { letter: 'B', text: '', isCorrect: false },
          { letter: 'C', text: '', isCorrect: false },
          { letter: 'D', text: '', isCorrect: false },
        ],
        correctAnswer: '',
      },
    ]);
  };

  const generateQuestions = async () => {
    if (!ebookId) {
      setError('Select an ebook first to generate questions from its content');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ebookId, numberOfQuestions: genCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Generation failed');

      const newQs: QuestionDraft[] = (data.questions || []).map((q: any) => ({
        id: crypto.randomUUID(),
        questionText: q.questionText || '',
        type: q.type || 'MCQ',
        marks: q.marks || 1,
        difficulty: q.difficulty || 'MEDIUM',
        options:
          q.options && q.options.length > 0
            ? q.options.map((o: any) => ({
                letter: o.letter,
                text: o.text,
                isCorrect: !!o.isCorrect,
              }))
            : [
                { letter: 'A', text: '', isCorrect: false },
                { letter: 'B', text: '', isCorrect: false },
                { letter: 'C', text: '', isCorrect: false },
                { letter: 'D', text: '', isCorrect: false },
              ],
        correctAnswer: q.correctAnswer || '',
      }));

      setQuestions((prev) => [...prev, ...newQs]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Test title is required');
      return;
    }
    if (questions.length === 0) {
      setError('Add at least one question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          instructions,
          totalMarks,
          passingMarks,
          duration,
          ebookId: ebookId || null,
          questions: questions.map((q, i) => ({
            questionText: q.questionText,
            type: q.type,
            marks: q.marks,
            difficulty: q.difficulty,
            correctAnswer: q.correctAnswer,
            questionOrder: i + 1,
            options:
              q.type === 'MCQ'
                ? q.options.filter((o) => o.text.trim())
                : undefined,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create test');

      router.push('/tests');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tests" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Test</h1>
          <p className="text-gray-600 text-sm">
            Build a new assessment for your students
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Test Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. Mathematics Midterm Exam"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Answer all questions. Show your work..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Linked Ebook (optional)
            </label>
            <select
              value={ebookId}
              onChange={(e) => setEbookId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">None</option>
              {ebooks.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">
              Questions ({questions.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                {[3, 5, 8, 10, 15].map((n) => (
                  <option key={n} value={n}>
                    {n} Qs
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={generateQuestions}
                disabled={generating || !ebookId}
                className="inline-flex items-center gap-1.5 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 font-medium disabled:opacity-50"
                title={!ebookId ? 'Select an ebook first' : 'Generate from ebook content'}
              >
                <Sparkles size={16} />
                {generating ? 'Generating...' : 'AI Generate'}
              </button>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 font-medium"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>
          </div>

          {questions.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">
              No questions added yet. Click &quot;Add Question&quot; to start.
            </p>
          )}

          {questions.map((q, index) => (
            <div
              key={q.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Question {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <textarea
                value={q.questionText}
                onChange={(e) =>
                  updateQuestion(q.id, { questionText: e.target.value })
                }
                rows={2}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Enter question text..."
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <select
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(q.id, {
                      type: e.target.value as QuestionDraft['type'],
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="MCQ">MCQ</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                  <option value="ESSAY">Essay</option>
                </select>
                <select
                  value={q.difficulty}
                  onChange={(e) =>
                    updateQuestion(q.id, {
                      difficulty: e.target.value as QuestionDraft['difficulty'],
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                <input
                  type="number"
                  value={q.marks}
                  onChange={(e) =>
                    updateQuestion(q.id, { marks: Number(e.target.value) })
                  }
                  min={1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Marks"
                />
              </div>

              {q.type === 'MCQ' && (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={opt.letter} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={opt.isCorrect}
                        onChange={() => {
                          const newOpts = q.options.map((o, i) => ({
                            ...o,
                            isCorrect: i === oi,
                          }));
                          updateQuestion(q.id, { options: newOpts });
                        }}
                      />
                      <span className="text-sm font-medium w-5">
                        {opt.letter}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[oi] = { ...opt, text: e.target.value };
                          updateQuestion(q.id, { options: newOpts });
                        }}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        placeholder={`Option ${opt.letter}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'TRUE_FALSE' && (
                <select
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(q.id, { correctAnswer: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select correct answer</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              )}

              {(q.type === 'SHORT_ANSWER' || q.type === 'ESSAY') && (
                <input
                  type="text"
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(q.id, { correctAnswer: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Sample / expected answer (optional)"
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Test'}
        </button>
      </form>
    </div>
  );
}
