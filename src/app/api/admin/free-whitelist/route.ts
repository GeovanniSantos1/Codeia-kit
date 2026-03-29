import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin-utils'
import { db } from '@/lib/db'
import { withApiLogging } from '@/lib/logging/api'

async function handleGet() {
  const { userId } = await auth()
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const entries = await db.freeWhitelistedEmail.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ entries })
}

async function handlePost(req: NextRequest) {
  const { userId } = await auth()
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const email = (body.email ?? '').trim().toLowerCase()
  const note = (body.note ?? '').trim() || null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
  }

  const existing = await db.freeWhitelistedEmail.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'E-mail já cadastrado na lista gratuita' }, { status: 409 })
  }

  const entry = await db.freeWhitelistedEmail.create({
    data: { email, note, addedBy: userId },
  })
  return NextResponse.json({ entry }, { status: 201 })
}

export const GET = withApiLogging(handleGet, {
  method: 'GET',
  route: '/api/admin/free-whitelist',
  feature: 'admin',
})

export const POST = withApiLogging(handlePost, {
  method: 'POST',
  route: '/api/admin/free-whitelist',
  feature: 'admin',
})
