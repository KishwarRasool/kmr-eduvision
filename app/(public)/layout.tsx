import { ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
