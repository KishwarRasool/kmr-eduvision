'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function UploadEbookPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const ext = selected.name.toLowerCase();
      if (!ext.endsWith('.pdf') && !ext.endsWith('.epub')) {
        setError('Only PDF and EPUB files are allowed');
        return;
      }
      if (selected.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setFile(selected);
      setError('');
      if (!title) {
        setTitle(selected.name.replace(/\.(pdf|epub)$/i, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Title and file are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', file);

      const res = await fetch('/api/ebooks', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/ebooks');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ebook Uploaded!
        </h2>
        <p className="text-gray-600">Redirecting to ebooks list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/ebooks"
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Ebook</h1>
          <p className="text-gray-600 text-sm">
            Add a PDF or EPUB textbook to your library
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File *
          </label>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            {file ? (
              <div className="text-center">
                <FileText size={36} className="mx-auto text-primary mb-2" />
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  PDF or EPUB (max 50MB)
                </p>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.epub"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="e.g. Mathematics Grade 10"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Optional description..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Upload Ebook'}
        </button>
      </form>
    </div>
  );
}
