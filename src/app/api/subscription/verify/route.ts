import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { asaasClient } from '@/lib/asaas/client';
import { ASAAS_CONFIG } from '@/lib/asaas/config';

const CONFIRMED_STATUSES = ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'];

export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const asaasCustomerId = ASAAS_CONFIG.isSandbox
            ? dbUser.asaasCustomerIdSandbox
            : dbUser.asaasCustomerIdProduction;

        if (!asaasCustomerId) {
            return NextResponse.json({ verified: false, message: 'Nenhuma assinatura encontrada para este usuário.' });
        }

        // Fetch all subscriptions for this customer
        const subscriptionsRes = await asaasClient.listCustomerSubscriptions(asaasCustomerId);
        const subscriptions = subscriptionsRes.data;

        if (!subscriptions.length) {
            return NextResponse.json({ verified: false, message: 'Nenhuma assinatura encontrada no Asaas.' });
        }

        // Check payments for each subscription — most recent first
        for (const subscription of subscriptions) {
            const paymentsRes = await asaasClient.getSubscriptionPayments(subscription.id);
            const payments = paymentsRes.data as Array<{
                id: string; status: string; externalReference?: string; subscription?: string;
            }>;

            const confirmedPayment = payments.find(p => CONFIRMED_STATUSES.includes(p.status));
            if (!confirmedPayment) continue;

            // Resolve plan from externalReference
            const planId = subscription.externalReference ?? confirmedPayment.externalReference;
            if (!planId) continue;

            const dbPlan = await prisma.plan.findUnique({ where: { id: planId } });
            if (!dbPlan) continue;

            const billingPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await prisma.creditBalance.upsert({
                where: { userId: dbUser.id },
                create: {
                    userId: dbUser.id,
                    clerkUserId: userId,
                    creditsRemaining: dbPlan.credits,
                    lastSyncedAt: new Date(),
                },
                update: {
                    creditsRemaining: dbPlan.credits,
                    lastSyncedAt: new Date(),
                },
            });

            await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                    asaasSubscriptionId: subscription.id,
                    currentPlanId: dbPlan.id,
                    billingPeriodEnd,
                    cancellationScheduled: false,
                    cancellationDate: null,
                },
            });

            console.log(`[Verify] Subscription activated for ${dbUser.email} → plan ${dbPlan.name}`);
            return NextResponse.json({ verified: true, plan: dbPlan.name });
        }

        return NextResponse.json({ verified: false, message: 'Pagamento ainda não confirmado. Aguarde alguns instantes e tente novamente.' });

    } catch (error) {
        console.error('[Verify] Error:', error);
        return NextResponse.json({ error: 'Erro ao verificar pagamento.' }, { status: 500 });
    }
}
