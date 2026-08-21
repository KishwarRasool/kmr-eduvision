'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Search, FileText, Trash2 } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';

interface Ebook {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  pages?: number;
  uploadedAt: string;
}

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      const res = await fetch('/api/ebooks');
      if (res.ok) {
        const data = await res.json();
        setEbooks(data.ebooks || []);
      }
    } catch (error) {
      console.error('Failed to fetch ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ebook?')) return;
    try {
      const res = await fetch(`/api/ebooks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEbooks((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filtered = ebooks.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ebooks</h1>
          <p className="text-gray-600 mt-1">
            Manage your textbooks and study materials
          </p>
        </div>
        <Link
          href="/ebooks/upload"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 font-medium"
        >
          <Plus size={18} />
          Upload Ebook
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search ebooks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No ebooks yet
          </h3>
          <p className="text-gray-500 mb-6">
            Upload your first PDF or EPUB to get started
          </p>
          <Link
            href="/ebooks/upload"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90"
          >
            <Plus size={18} />
            Upload Ebook
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ebook) => (
            <div
              key={ebook.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText size={22} className="text-primary" />
                </div>
                <button
                  onClick={() => handleDelete(ebook.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {ebook.title}
              </h3>
              {ebook.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {ebook.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {ebook.fileType}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {formatFileSize(Number(ebook.fileSize))}
                </span>
                {ebook.pages && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {ebook.pages} pages
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Uploaded {formatDate(new Date(ebook.uploadedAt))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
