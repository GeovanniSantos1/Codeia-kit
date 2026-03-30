import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin-utils'
import { db } from '@/lib/db'
import { withApiLogging } from '@/lib/logging/api'

async function handlePatch(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const { status, adminNote } = body

  const allowed = ['pending', 'reviewing', 'approved', 'rejected']
  if (status && !allowed.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const application = await db.loanApplicationRequest.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(adminNote !== undefined && { adminNote }),
    },
  })
  return NextResponse.json({ application })
}

export const PATCH = withApiLogging(handlePatch, {
  method: 'PATCH',
  route: '/api/admin/loan-requests/[id]',
  feature: 'admin',
})
