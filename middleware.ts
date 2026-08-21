import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect dashboard and related routes
    if (path.startsWith('/dashboard') || path.startsWith('/ebooks') || path.startsWith('/tests') || path.startsWith('/students') || path.startsWith('/submissions') || path.startsWith('/reports')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/ebooks/:path*',
    '/tests/:path*',
    '/students/:path*',
    '/submissions/:path*',
    '/reports/:path*',
  ],
};
