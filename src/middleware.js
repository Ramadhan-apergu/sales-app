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

  // Jika ke root atau belum login, redirect ke login
  if (
    !access_token ||
    !role ||
    !role_token
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
  }

  // Cek apakah path termasuk protected route
  const matchedPrefix = PROTECTED_ROUTES.find(route => pathname.startsWith(route))
  if (matchedPrefix) {
    const userGroup =
      matchedPrefix === '/super-admin' ? 'admin'
      : matchedPrefix === '/sales-indoor' ? 'sales-indoor'
      : 'sales-outdoor'

    const hashInput = `${userGroup}${process.env.HASH_SALT}`
    const expectedHash = await sha1(hashInput)

    if (role_token !== expectedHash) {
      return NextResponse.rewrite(new URL('/404', request.url))
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
