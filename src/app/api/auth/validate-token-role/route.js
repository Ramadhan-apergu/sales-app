import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req) {
  const body = await req.json()
  const { token } = body

  let ROLES = []
  const HASH_SALT = process.env.HASH_SALT || ''

  try {
    const rolesString = process.env.ROLES

    ROLES = JSON.parse(rolesString)
  } catch (error) {
    console.error('Failed to parse ROLES from env:', error)
    ROLES = []
  }

  let role = ''
  let valid = false

  ROLES.forEach(roles => {
    const expectedHash = crypto
    .createHash('sha1')
    .update(roles + HASH_SALT)
    .digest('hex')

    if (expectedHash === token) {
        valid = true
        role = roles
    }
});

if (role == 'admin') {
    role = 'super-admin'
}

  return NextResponse.json({
    valid,
    role,
  })
}
