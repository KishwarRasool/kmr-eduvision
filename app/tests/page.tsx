'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, Clock, Award } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Test {
  id: string;
  title: string;
  description?: string;
  totalMarks: number;
  duration?: number;
  status: string;
  createdAt: string;
  _count?: { questions: number };
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-700';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filtered = tests.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests</h1>
          <p className="text-gray-600 mt-1">
            Create and manage assessments
          </p>
        </div>
        <Link
          href="/tests/create"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 font-medium"
        >
          <Plus size={18} />
          Create Test
        </Link>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No tests yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first test to start assessing students
          </p>
          <Link
            href="/tests/create"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90"
          >
            <Plus size={18} />
            Create Test
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((test) => (
            <Link
              key={test.id}
              href={`/tests/${test.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {test.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(
                        test.status
                      )}`}
                    >
                      {test.status}
                    </span>
                  </div>
                  {test.description && (
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {test.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Award size={14} />
                      {test.totalMarks} marks
                    </span>
                    {test.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {test.duration} min
                      </span>
                    )}
                    <span>
                      Created {formatDate(new Date(test.createdAt))}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
