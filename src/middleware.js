import { NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/super-admin', '/sales-outdoor', '/sales-indoor']

function sha1(message) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  return crypto.subtle.digest('SHA-1', data).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  })
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const access_token = request.cookies.get('x_atkn')?.value
  const role_token = request.cookies.get('u_ctx')?.value
  const role = request.cookies.get('role')?.value

  // Jika tidak ada token sama sekali, redirect ke login
  if (
    !access_token ||
    !role ||
    !role_token
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect root ke dashboard berdasarkan role
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
  }

  // Cek rute yang dilindungi
  const matchedPrefix = PROTECTED_ROUTES.find(route => pathname.startsWith(route))
  if (matchedPrefix) {
    const userGroup =
      matchedPrefix === '/super-admin' ? 'admin'
      : matchedPrefix === '/sales-indoor' ? 'sales-indoor'
      : 'sales-outdoor'

    const hashInput = `${userGroup}${process.env.HASH_SALT}`
    const expectedHash = await sha1(hashInput)

    // Jika role token tidak cocok dengan hash yang diharapkan,
    // berarti ada masalah integritas sesi atau akses tidak sah.
    // Arahkan ke halaman login dan bersihkan cookies.
    if (role_token !== expectedHash) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      // Hapus cookies dari middleware untuk memastikan status bersih
      response.cookies.delete('x_atkn');
      response.cookies.delete('u_ctx');
      response.cookies.delete('role');
      return response;
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/super-admin/:path*',
    '/sales-indoor/:path*',
    '/sales-outdoor/:path*',
  ],
}
