import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { withApiLogging } from '@/lib/logging/api'

async function handleSubscriptionStatus() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const clerkUser = await currentUser()
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? null

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { creditBalance: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 1. Check if user has an active paid plan
    if (user.currentPlanId) {
      const plan = await db.plan.findUnique({ where: { id: user.currentPlanId } })
      if (plan) {
        return NextResponse.json({
          isActive: true,
          plan: plan.name,
          planId: plan.id,
          planType: 'paid',
          billingPeriodEnd: user.billingPeriodEnd?.toISOString() || null,
          cancellationScheduled: user.cancellationScheduled || false,
        })
      }
    }

    // 2. Check if user email is whitelisted for free access
    if (userEmail) {
      const whitelisted = await db.freeWhitelistedEmail.findUnique({
        where: { email: userEmail },
      })
      if (whitelisted) {
        return NextResponse.json({
          isActive: true,
          plan: 'Gratuito',
          planId: 'free-whitelist',
          planType: 'free',
          billingPeriodEnd: null,
          cancellationScheduled: false,
        })
      }
    }

    // 3. No active plan and not whitelisted
    return NextResponse.json({
      isActive: false,
      plan: 'none',
      planId: null,
      planType: 'none',
      billingPeriodEnd: null,
      cancellationScheduled: false,
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json({ error: 'Failed to resolve subscription status' }, { status: 500 })
  }
}

export const GET = withApiLogging(handleSubscriptionStatus, {
  method: 'GET',
  route: '/api/subscription/status',
  feature: 'subscription',
})
