'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Submission {
  id: string;
  status: string;
  assignedAt: string;
  submittedAt?: string;
  test: { id: string; title: string; totalMarks: number };
  student: { id: string; name: string; email: string };
  grade?: {
    obtainedMarks: number;
    percentage: number;
    grade: string;
  };
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.student.name.toLowerCase().includes(search.toLowerCase()) ||
      s.test.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <p className="text-gray-600 mt-1">
          Review and grade student submissions
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by student or test..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="ALL">All Status</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="GRADED">Graded</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No submissions yet
          </h3>
          <p className="text-gray-500">
            Assign tests to students to see submissions here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">
                    Student
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">
                    Test
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3 hidden md:table-cell">
                    Score
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3 hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">
                        {sub.student.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sub.student.email}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {sub.test.title}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm hidden md:table-cell">
                      {sub.grade
                        ? `${sub.grade.obtainedMarks}/${sub.test.totalMarks} (${sub.grade.percentage}%) — ${sub.grade.grade}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 hidden lg:table-cell">
                      {sub.submittedAt
                        ? formatDate(new Date(sub.submittedAt))
                        : formatDate(new Date(sub.assignedAt))}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/submissions/${sub.id}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {sub.status === 'GRADED' ? 'View' : 'Grade'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
