'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, Award, CheckCircle, Play } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Assignment {
  id: string;
  status: string;
  assignedAt: string;
  dueDate?: string;
  test: {
    id: string;
    title: string;
    description?: string;
    totalMarks: number;
    duration?: number;
    status: string;
    _count: { questions: number };
  };
  grade?: {
    obtainedMarks: number;
    percentage: number;
    grade: string;
  };
}

export default function StudentTestsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/assignments')
      .then((r) => r.json())
      .then((d) => setAssignments(d.assignments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case 'GRADED':
        return 'bg-green-100 text-green-700';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tests</h1>
        <p className="text-gray-600 mt-1">
          Tests assigned to you by your teacher
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No tests assigned
          </h3>
          <p className="text-gray-500">
            When your teacher assigns a test, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {a.test.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(
                        a.status
                      )}`}
                    >
                      {a.status}
                    </span>
                  </div>
                  {a.test.description && (
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {a.test.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Award size={14} />
                      {a.test.totalMarks} marks
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {a.test._count.questions} questions
                    </span>
                    {a.test.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {a.test.duration} min
                      </span>
                    )}
                    {a.dueDate && (
                      <span>
                        Due: {formatDate(new Date(a.dueDate))}
                      </span>
                    )}
                  </div>
                  {a.grade && (
                    <p className="text-sm text-green-700 font-medium mt-2 flex items-center gap-1">
                      <CheckCircle size={14} />
                      Score: {a.grade.obtainedMarks}/{a.test.totalMarks} (
                      {a.grade.percentage}%) — Grade {a.grade.grade}
                    </p>
                  )}
                </div>

                {(a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS') && (
                  <Link
                    href={`/take-test/${a.id}`}
                    className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm font-medium shrink-0"
                  >
                    <Play size={16} />
                    {a.status === 'IN_PROGRESS' ? 'Continue' : 'Start Test'}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
