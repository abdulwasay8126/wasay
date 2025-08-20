import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isDashboard = pathname.startsWith('/dashboard');
  if (!isDashboard) return NextResponse.next();

  const isAuthed = req.cookies.get('auth')?.value === '1';
  if (isAuthed) return NextResponse.next();

  const loginUrl = new URL('/', req.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard']
};

