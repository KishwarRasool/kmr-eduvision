'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, Award, TrendingUp } from 'lucide-react';

interface ReportStats {
  totalEbooks: number;
  totalTests: number;
  totalStudents: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((d) => setStats(d.stats || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Ebooks',
      value: stats?.totalEbooks ?? 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Tests',
      value: stats?.totalTests ?? 0,
      icon: FileText,
      color: 'bg-orange-500',
    },
    {
      label: 'Students',
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Submissions',
      value: stats?.totalSubmissions ?? 0,
      icon: BarChart3,
      color: 'bg-purple-500',
    },
    {
      label: 'Graded',
      value: stats?.gradedSubmissions ?? 0,
      icon: Award,
      color: 'bg-teal-500',
    },
    {
      label: 'Average Score',
      value: `${stats?.averageScore ?? 0}%`,
      icon: TrendingUp,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">
          Overview of your teaching activity and student performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Overview
        </h2>
        {!stats || stats.totalSubmissions === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 size={40} className="mx-auto text-gray-300 mb-3" />
            <p>No performance data yet.</p>
            <p className="text-sm mt-1">
              Create tests and collect submissions to see analytics here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Grading Progress</span>
              <span className="font-medium">
                {stats.gradedSubmissions} / {stats.totalSubmissions} graded
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{
                  width: `${
                    stats.totalSubmissions
                      ? Math.round(
                          (stats.gradedSubmissions / stats.totalSubmissions) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-gray-600">Class Average</span>
              <span className="font-medium text-primary text-lg">
                {stats.averageScore}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
