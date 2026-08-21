'use client';

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

export default function DashboardPage() {
  const { data: session } = useSession();

  const stats = [
    {
      label: 'Total Ebooks',
      value: '0',
      icon: BookOpen,
      color: 'bg-blue-500',
      href: '/ebooks',
    },
    {
      label: 'Active Tests',
      value: '0',
      icon: FileText,
      color: 'bg-orange-500',
      href: '/tests',
    },
    {
      label: 'Students',
      value: '0',
      icon: Users,
      color: 'bg-green-500',
      href: '/students',
    },
    {
      label: 'Pending Submissions',
      value: '0',
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
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Teacher'} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your classes today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
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

      {/* Quick Actions */}
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

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        <div className="text-center py-10 text-gray-500">
          <p>No recent activity yet.</p>
          <p className="text-sm mt-1">
            Upload an ebook or create a test to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
