'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface Option {
  id: string;
  optionText: string;
  optionLetter: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  type: string;
  marks: number;
  correctAnswer?: string;
  options: Option[];
}

interface Response {
  id: string;
  questionId: string;
  answerText?: string;
  selectedOption?: string;
  marksObtained: number;
  isCorrect?: boolean;
}

interface Submission {
  id: string;
  status: string;
  test: {
    id: string;
    title: string;
    totalMarks: number;
    questions: Question[];
  };
  student: { id: string; name: string; email: string };
  responses: Response[];
  grade?: {
    obtainedMarks: number;
    percentage: number;
    grade: string;
    feedback?: string;
  };
}

export default function GradeSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (params.id) fetchSubmission();
  }, [params.id]);

  const fetchSubmission = async () => {
    try {
      const res = await fetch(`/api/submissions/${params.id}`);
      if (!res.ok) throw new Error('Submission not found');
      const data = await res.json();
      const sub = data.submission;
      setSubmission(sub);

      // Pre-fill marks
      const initial: Record<string, number> = {};
      for (const q of sub.test.questions) {
        const resp = sub.responses.find(
          (r: Response) => r.questionId === q.id
        );
        if (resp) {
          initial[q.id] = resp.marksObtained;
        } else {
          // Auto-suggest for MCQ/TF
          if (q.type === 'MCQ') {
            const correct = q.options.find((o: Option) => o.isCorrect);
            // no response yet
            initial[q.id] = 0;
          } else {
            initial[q.id] = 0;
          }
        }
      }
      // Auto-grade MCQ/TF if response exists
      for (const q of sub.test.questions) {
        const resp = sub.responses.find(
          (r: Response) => r.questionId === q.id
        );
        if (!resp) continue;
        if (q.type === 'MCQ') {
          const correct = q.options.find((o: Option) => o.isCorrect);
          if (correct && resp.selectedOption === correct.optionLetter) {
            initial[q.id] = q.marks;
          }
        } else if (q.type === 'TRUE_FALSE') {
          if (
            resp.answerText?.toLowerCase() === q.correctAnswer?.toLowerCase()
          ) {
            initial[q.id] = q.marks;
          }
        }
      }
      setMarks(initial);
      if (sub.grade?.feedback) setFeedback(sub.grade.feedback);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalObtained = Object.values(marks).reduce((a, b) => a + b, 0);

  const handleGrade = async () => {
    if (!submission) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks, feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Grading failed');
      setSuccess(true);
      setTimeout(() => router.push('/submissions'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/submissions" className="text-primary hover:underline">
          Back to Submissions
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-20">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Graded Successfully!</h2>
        <p className="text-gray-500 mt-1">Redirecting...</p>
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/submissions"
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Submission</h1>
          <p className="text-gray-600 text-sm">
            {submission.student.name} — {submission.test.title}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Current Score</p>
          <p className="text-2xl font-bold text-primary">
            {totalObtained} / {submission.test.totalMarks}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium">{submission.status}</p>
        </div>
      </div>

      <div className="space-y-4">
        {submission.test.questions.map((q, i) => {
          const resp = submission.responses.find(
            (r) => r.questionId === q.id
          );
          return (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
            >
              <div className="flex justify-between gap-3">
                <p className="font-medium text-gray-900">
                  <span className="text-primary mr-2">Q{i + 1}.</span>
                  {q.questionText}
                </p>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded shrink-0">
                  {q.marks} marks · {q.type}
                </span>
              </div>

              {/* Student answer */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-xs text-gray-500 mb-1">Student Answer:</p>
                {q.type === 'MCQ' ? (
                  <p className="font-medium">
                    {resp?.selectedOption
                      ? `${resp.selectedOption}) ${
                          q.options.find(
                            (o) => o.optionLetter === resp.selectedOption
                          )?.optionText || ''
                        }`
                      : 'No answer'}
                  </p>
                ) : (
                  <p className="font-medium">
                    {resp?.answerText || 'No answer'}
                  </p>
                )}
              </div>

              {/* Correct answer hint */}
              {(q.type === 'MCQ' || q.type === 'TRUE_FALSE') && (
                <p className="text-xs text-green-700">
                  Correct:{' '}
                  {q.type === 'MCQ'
                    ? q.options.find((o) => o.isCorrect)?.optionLetter
                    : q.correctAnswer}
                </p>
              )}

              {/* Marks input */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Marks:</label>
                <input
                  type="number"
                  min={0}
                  max={q.marks}
                  value={marks[q.id] ?? 0}
                  onChange={(e) =>
                    setMarks({
                      ...marks,
                      [q.id]: Math.min(q.marks, Math.max(0, Number(e.target.value))),
                    })
                  }
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-sm text-gray-400">/ {q.marks}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Feedback (optional)
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Write feedback for the student..."
        />
      </div>

      <button
        onClick={handleGrade}
        disabled={saving}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
      >
        {saving
          ? 'Saving...'
          : `Submit Grade (${totalObtained}/${submission.test.totalMarks})`}
      </button>
    </div>
  );
}
