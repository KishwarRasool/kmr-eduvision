'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, BarChart3, Users, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto flex items-center justify-center">
            <BookOpen size={40} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to <span className="text-primary">KMR-EduVision</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Smart Testing & Curriculum Management System for K-12 Schools
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/auth/login"
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight size={20} />
          </Link>
          <Link
            href="#features"
            className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary/5"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: 'Ebook Management',
              description: 'Upload and manage any ebook (PDF, EPUB) with automatic text extraction',
            },
            {
              icon: FileText,
              title: 'Smart Test Creation',
              description: 'Create professional tests with multiple question types and auto-grading',
            },
            {
              icon: Zap,
              title: 'Download & Print',
              description: 'Generate PDFs, Word documents, and print tests directly from the platform',
            },
            {
              icon: Users,
              title: 'Student Management',
              description: 'Assign tests and manage student submissions with ease',
            },
            {
              icon: Shield,
              title: 'Secure Grading',
              description: 'Auto-grade MCQs and manually grade essays with detailed feedback',
            },
            {
              icon: BarChart3,
              title: 'Analytics & Reports',
              description: 'Get detailed insights into student performance and class analytics',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <Icon size={32} className="text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white p-12 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Education?</h2>
        <p className="text-lg mb-6">
          Join thousands of teachers using KMR-EduVision to automate testing and curriculum management
        </p>
        <Link
          href="/auth/register"
          className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  );
}
