import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Teachers/admins should not use student take-test as primary (allowed but ok)
    // Students redirected away from teacher routes
    const teacherRoutes = [
      '/dashboard',
      '/ebooks',
      '/tests',
      '/students',
      '/submissions',
      '/reports',
    ];

    const isTeacherRoute = teacherRoutes.some(
      (r) => path === r || path.startsWith(r + '/')
    );

    if (isTeacherRoute && token.role === 'STUDENT') {
      return NextResponse.redirect(new URL('/take-test', req.url));
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
    '/take-test/:path*',
  ],
};
