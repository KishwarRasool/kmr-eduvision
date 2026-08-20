'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

export const metadata = {
  title: 'KMR-EduVision',
  description: 'Smart Testing & Curriculum Management System for K-12 Schools',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
