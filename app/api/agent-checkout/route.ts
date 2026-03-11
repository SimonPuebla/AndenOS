import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { AgentTier, TIER_PRICES, TIER_LABELS } from '@/types/agent'

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })

    const stripe = new Stripe(stripeKey)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { tier } = await req.json() as { tier: AgentTier }
    const prices = TIER_PRICES[tier]
    if (!prices) return NextResponse.json({ error: 'Tier inválido' }, { status: 400 })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Andén Smart Fiduciae — ${TIER_LABELS[tier]}`,
            description: 'Setup fideicomiso con administración algorítmica · Founding Member',
          },
          unit_amount: prices.setup * 100,
        },
        quantity: 1,
      }],
      metadata: { userId: user.id, tier, track: 'agent' },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/agents/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/agents/registro/pago?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json({ error: e.message || 'Error interno' }, { status: 500 })
  }
}
