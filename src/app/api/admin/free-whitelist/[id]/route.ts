import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin-utils'
import { db } from '@/lib/db'
import { withApiLogging } from '@/lib/logging/api'

async function handleDelete(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { id } = await params
  const entry = await db.freeWhitelistedEmail.findUnique({ where: { id } })
  if (!entry) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }
  await db.freeWhitelistedEmail.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

export const DELETE = withApiLogging(handleDelete, {
  method: 'DELETE',
  route: '/api/admin/free-whitelist/[id]',
  feature: 'admin',
})
