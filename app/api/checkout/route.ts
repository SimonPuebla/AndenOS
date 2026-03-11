import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Price IDs — these should be created in Stripe Dashboard and stored as env vars
// For POC we compute the price dynamically
const PRICES: Record<string, number> = {
  CASO_1: 50000,  // USD 500
  CASO_3: 150000, // USD 1500
  CASO_4: 200000, // USD 2000
}
const ADVISOR_ADDON = 29000 // USD 290

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
    }
    const stripe = new Stripe(stripeKey)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { caso, advisorMode } = body

    const basePrice = PRICES[caso] || PRICES.CASO_3
    const totalPrice = basePrice + (advisorMode === 'asesor' ? ADVISOR_ADDON : 0)

    const casoLabel: Record<string, string> = {
      CASO_1: 'SAS simple',
      CASO_3: 'SAS en DEZ + LEC',
      CASO_4: 'Delaware + SAS en DEZ + LEC',
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Andén — ${casoLabel[caso] || caso}`,
              description: `Constitución de empresa en Argentina${advisorMode === 'asesor' ? ' + Asesor humano dedicado' : ''}`,
            },
            unit_amount: totalPrice,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        caso,
        advisorMode: advisorMode || 'solo',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/registro/pago?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const e = err as { message?: string }
    console.error('Stripe checkout error:', e)
    return NextResponse.json({ error: e.message || 'Error interno' }, { status: 500 })
  }
}
