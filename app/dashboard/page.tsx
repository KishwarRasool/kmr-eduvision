'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  BookOpen,
  FileText,
  Users,
  ClipboardCheck,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalEbooks: number;
  totalTests: number;
  totalStudents: number;
  totalSubmissions: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalEbooks: 0,
    totalTests: 0,
    totalStudents: 0,
    totalSubmissions: 0,
  });

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((d) => {
        if (d.stats) {
          setStats({
            totalEbooks: d.stats.totalEbooks,
            totalTests: d.stats.totalTests,
            totalStudents: d.stats.totalStudents,
            totalSubmissions: d.stats.totalSubmissions,
          });
        }
      })
      .catch(console.error);
  }, []);

  const statCards = [
    {
      label: 'Total Ebooks',
      value: String(stats.totalEbooks),
      icon: BookOpen,
      color: 'bg-blue-500',
      href: '/ebooks',
    },
    {
      label: 'Active Tests',
      value: String(stats.totalTests),
      icon: FileText,
      color: 'bg-orange-500',
      href: '/tests',
    },
    {
      label: 'Students',
      value: String(stats.totalStudents),
      icon: Users,
      color: 'bg-green-500',
      href: '/students',
    },
    {
      label: 'Submissions',
      value: String(stats.totalSubmissions),
      icon: ClipboardCheck,
      color: 'bg-purple-500',
      href: '/submissions',
    },
  ];

  const quickActions = [
    {
      title: 'Upload Ebook',
      description: 'Add a new PDF or EPUB textbook',
      href: '/ebooks/upload',
      icon: BookOpen,
    },
    {
      title: 'Create Test',
      description: 'Build a new assessment from your content',
      href: '/tests/create',
      icon: FileText,
    },
    {
      title: 'View Reports',
      description: 'Check student performance analytics',
      href: '/reports',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Teacher'} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your classes today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Getting Started
          </h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            1. <strong>Upload ebooks</strong> — Add PDF/EPUB textbooks to your library
          </p>
          <p>
            2. <strong>Create tests</strong> — Build assessments with MCQ, True/False, Short Answer & Essay questions
          </p>
          <p>
            3. <strong>Add students</strong> — Register students so you can assign tests
          </p>
          <p>
            4. <strong>Track progress</strong> — View submissions and reports
          </p>
        </div>
      </div>
    </div>
  );
}
