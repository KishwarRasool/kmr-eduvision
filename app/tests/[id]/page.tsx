'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Award,
  FileText,
  Download,
  Users,
  Trash2,
  Edit,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface QuestionOption {
  id: string;
  optionText: string;
  optionLetter: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  type: string;
  difficulty: string;
  marks: number;
  correctAnswer?: string;
  questionOrder?: number;
  options: QuestionOption[];
}

interface TestDetail {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  totalMarks: number;
  passingMarks: number;
  duration?: number;
  status: string;
  createdAt: string;
  questions: Question[];
}

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (params.id) fetchTest();
  }, [params.id]);

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/tests/${params.id}`);
      if (!res.ok) throw new Error('Test not found');
      const data = await res.json();
      setTest(data.test);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!test) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/tests/${test.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: test.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTest(data.test);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!test || !confirm('Delete this test permanently?')) return;
    try {
      const res = await fetch(`/api/tests/${test.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/tests');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = () => {
    if (!test) return;
    window.open(`/api/tests/${test.id}/download-pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error || 'Test not found'}</p>
        <Link href="/tests" className="text-primary hover:underline">
          Back to Tests
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/tests" className="p-2 rounded-lg hover:bg-gray-100 mt-1">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                test.status === 'PUBLISHED'
                  ? 'bg-green-100 text-green-700'
                  : test.status === 'DRAFT'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {test.status}
            </span>
          </div>
          {test.description && (
            <p className="text-gray-600">{test.description}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
        >
          {publishing
            ? 'Updating...'
            : test.status === 'PUBLISHED'
            ? 'Unpublish'
            : 'Publish Test'}
        </button>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          <Download size={16} />
          Download PDF
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* Meta */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500">Total Marks</p>
          <p className="font-semibold flex items-center gap-1 mt-0.5">
            <Award size={16} className="text-primary" />
            {test.totalMarks}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Passing Marks</p>
          <p className="font-semibold mt-0.5">{test.passingMarks}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Duration</p>
          <p className="font-semibold flex items-center gap-1 mt-0.5">
            <Clock size={16} className="text-primary" />
            {test.duration ? `${test.duration} min` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Questions</p>
          <p className="font-semibold flex items-center gap-1 mt-0.5">
            <FileText size={16} className="text-primary" />
            {test.questions.length}
          </p>
        </div>
      </div>

      {test.instructions && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-900 mb-1">Instructions</p>
          <p className="text-sm text-blue-800">{test.instructions}</p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Questions ({test.questions.length})
        </h2>
        {test.questions
          .sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0))
          .map((q, i) => (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-medium text-gray-900">
                  <span className="text-primary mr-2">Q{i + 1}.</span>
                  {q.questionText}
                </p>
                <div className="flex gap-1.5 shrink-0">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {q.type}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {q.marks} mark{q.marks !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {q.difficulty}
                  </span>
                </div>
              </div>

              {q.type === 'MCQ' && q.options?.length > 0 && (
                <div className="mt-3 space-y-1.5 pl-6">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`text-sm flex items-center gap-2 ${
                        opt.isCorrect
                          ? 'text-green-700 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      <span className="w-5">{opt.optionLetter})</span>
                      <span>{opt.optionText}</span>
                      {opt.isCorrect && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'TRUE_FALSE' && q.correctAnswer && (
                <p className="mt-2 text-sm text-green-700 pl-6">
                  Answer: {q.correctAnswer}
                </p>
              )}

              {(q.type === 'SHORT_ANSWER' || q.type === 'ESSAY') &&
                q.correctAnswer && (
                  <p className="mt-2 text-sm text-gray-500 pl-6">
                    Sample answer: {q.correctAnswer}
                  </p>
                )}
            </div>
          ))}
      </div>

      <p className="text-xs text-gray-400">
        Created {formatDate(new Date(test.createdAt))}
      </p>
    </div>
  );
}
