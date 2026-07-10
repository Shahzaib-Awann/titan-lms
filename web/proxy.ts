import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host');

  if (!hostname) return NextResponse.next();

  // Strip the port number for local development (e.g., admin.localhost:3000 -> admin.localhost)
  const currentHost = hostname.split(':')[0];

  // Extract the subdomain
  const subdomain = currentHost.split('.')[0];

  // Define LMS subdomains
  const allowedSubdomains = ['admin', 'teacher', 'student'];

  // If the subdomain is one of our roles, rewrite the URL internally
  if (allowedSubdomains.includes(subdomain)) {
    // Example: admin.example.com/dashboard becomes /admin/dashboard internally
    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // If it's the main domain (example.com), just continue normally
  return NextResponse.next();
}

// Ensure the middleware runs on all routes EXCEPT API, static files, and images
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};