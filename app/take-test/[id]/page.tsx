'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';

interface Option {
  id: string;
  optionText: string;
  optionLetter: string;
}

interface Question {
  id: string;
  questionText: string;
  type: string;
  marks: number;
  options: Option[];
}

interface Assignment {
  id: string;
  status: string;
  test: {
    id: string;
    title: string;
    instructions?: string;
    totalMarks: number;
    duration?: number;
    questions: Question[];
  };
}

export default function TakeTestPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<
    Record<string, { selectedOption?: string; answerText?: string }>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    obtainedMarks?: number;
    totalMarks: number;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (params.id) fetchAssignment();
  }, [params.id]);

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/student/assignments/${params.id}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Not found');
      }
      const data = await res.json();
      const a = data.assignment;

      if (a.status === 'SUBMITTED' || a.status === 'GRADED') {
        setError('This test has already been submitted.');
        setLoading(false);
        return;
      }

      setAssignment(a);
      // Init empty answers
      const init: typeof answers = {};
      for (const q of a.test.questions) {
        init[q.id] = {};
      }
      setAnswers(init);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setAnswer = (
    questionId: string,
    value: { selectedOption?: string; answerText?: string }
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...value },
    }));
  };

  const handleSubmit = async () => {
    if (!assignment) return;
    if (!confirm('Are you sure you want to submit? You cannot change answers after submitting.')) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/student/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.id,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submit failed');

      setResult({
        obtainedMarks: data.obtainedMarks,
        totalMarks: data.totalMarks,
        status: data.status,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="text-center py-16 space-y-4">
        <CheckCircle size={56} className="mx-auto text-green-500" />
        <h2 className="text-2xl font-bold text-gray-900">Test Submitted!</h2>
        {result.obtainedMarks !== undefined ? (
          <p className="text-lg text-gray-700">
            Your score:{' '}
            <span className="font-bold text-primary">
              {result.obtainedMarks} / {result.totalMarks}
            </span>
          </p>
        ) : (
          <p className="text-gray-600">
            Your answers have been submitted. Subjective questions will be graded by your teacher.
          </p>
        )}
        <Link
          href="/take-test"
          className="inline-block mt-4 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90"
        >
          Back to My Tests
        </Link>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error || 'Test not found'}</p>
        <Link href="/take-test" className="text-primary hover:underline">
          Back to My Tests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/take-test" className="p-2 rounded-lg hover:bg-gray-100 mt-0.5">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {assignment.test.title}
          </h1>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
            <span>{assignment.test.totalMarks} marks</span>
            {assignment.test.duration && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {assignment.test.duration} minutes
              </span>
            )}
            <span>{assignment.test.questions.length} questions</span>
          </div>
        </div>
      </div>

      {assignment.test.instructions && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <strong>Instructions:</strong> {assignment.test.instructions}
        </div>
      )}

      <div className="space-y-5">
        {assignment.test.questions.map((q, i) => (
          <div
            key={q.id}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <div className="flex justify-between gap-2">
              <p className="font-medium text-gray-900">
                <span className="text-primary mr-2">Q{i + 1}.</span>
                {q.questionText}
              </p>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded shrink-0">
                {q.marks} mark{q.marks !== 1 ? 's' : ''}
              </span>
            </div>

            {q.type === 'MCQ' && (
              <div className="space-y-2 pl-2">
                {q.options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.optionLetter}
                      checked={answers[q.id]?.selectedOption === opt.optionLetter}
                      onChange={() =>
                        setAnswer(q.id, { selectedOption: opt.optionLetter })
                      }
                    />
                    <span className="text-sm">
                      <strong>{opt.optionLetter})</strong> {opt.optionText}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'TRUE_FALSE' && (
              <div className="flex gap-4 pl-2">
                {['True', 'False'].map((val) => (
                  <label
                    key={val}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={val}
                      checked={answers[q.id]?.answerText === val}
                      onChange={() => setAnswer(q.id, { answerText: val })}
                    />
                    <span className="text-sm font-medium">{val}</span>
                  </label>
                ))}
              </div>
            )}

            {(q.type === 'SHORT_ANSWER' || q.type === 'ESSAY') && (
              <textarea
                value={answers[q.id]?.answerText || ''}
                onChange={(e) =>
                  setAnswer(q.id, { answerText: e.target.value })
                }
                rows={q.type === 'ESSAY' ? 5 : 2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Type your answer here..."
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Test'}
      </button>
    </div>
  );
}
