import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export const middleware = async (req) => {
  const { pathname } = req.nextUrl;
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  const pb = new PocketBase(pbUrl);

  // Muat session dari cookie
  // PocketBase mengharapkan format string 'pb_auth=...'
  const authCookie = req.cookies.get('pb_auth');
  if (authCookie) {
    try {
      // Load the whole cookie string
      pb.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`);
    } catch (e) {
      console.error("Gagal memuat auth dari cookie:", e.message);
      pb.authStore.clear();
    }
  }

  console.log("Middleware - Path:", pathname);
  console.log("Middleware - Auth Valid:", pb.authStore.isValid);

  // Izinkan akses ke auth, api, dan public assets tanpa token
  if (
    pathname.startsWith('/auth') || 
    pathname.startsWith('/api') || 
    pathname === '/' ||
    pathname.includes('.') // file statis
  ) {
    return NextResponse.next();
  }

  // Jika tidak ada session yang valid untuk halaman terproteksi
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/user');
  
  if (isProtectedRoute && !pb.authStore.isValid) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Proteksi Berdasarkan Role
  const user = pb.authStore.model;
  
  // 1. Admin tidak boleh masuk ke /user
  if (pathname.startsWith('/user') && user?.role === 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // 2. User biasa tidak boleh masuk ke /admin
  if (pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/user', req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
