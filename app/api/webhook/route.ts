import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function generateExpedienteId() {
  const year = new Date().getFullYear()
  const num = Math.floor(Math.random() * 9000) + 1000
  return `AND-${year}-${num}`
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  const stripe = new Stripe(stripeKey)
  const resend = new Resend(process.env.RESEND_API_KEY)

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const e = err as { message?: string }
    console.error('Webhook signature error:', e.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, caso, advisorMode, track, tier } = session.metadata || {}

    if (!userId) {
      return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 })
    }

    // Use service role key for admin operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ── Track 2: Agent / Smart Fiduciae ─────────────────────────
    if (track === 'agent') {
      const amountPaid = (session.amount_total || 0) / 100
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const user = userData?.user
      const founderName = user?.user_metadata?.full_name || 'Founder'
      const founderEmail = user?.email || ''

      await supabase.from('agent_expedients')
        .update({ status: 'paid', stripe_session_id: session.id, amount_paid: amountPaid, paid_at: new Date().toISOString() })
        .eq('user_id', userId)

      await resend.emails.send({
        from: 'Andén <noreply@anden.tech>',
        to: 'hello@anden.tech',
        subject: `Smart Fiduciae — ${founderName} — ${tier?.toUpperCase()} — ${new Date().toLocaleDateString('es-AR')}`,
        text: `SMART FIDUCIAE\n============================\nFounder: ${founderName}\nEmail: ${founderEmail}\nTier: ${tier}\nMonto: USD ${amountPaid}\nFounding Member: Sí\nFecha: ${new Date().toISOString()}`,
      })
      await resend.emails.send({
        from: 'Andén <noreply@anden.tech>',
        to: founderEmail,
        subject: `Tu Smart Fiduciae — Tier ${tier}`,
        text: `Hola ${founderName},\n\nTu pago fue recibido. El equipo Andén revisará tu expediente y se contactará en las próximas 48hs.\n\nTier: ${tier}\nMonto: USD ${amountPaid}\nFounding Member: Sí ⭐\n\nAndén`,
      })
      return NextResponse.json({ received: true })
    }

    // Get user data
    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    const user = userData?.user
    const onboardingData = user?.user_metadata?.onboarding_state
      ? JSON.parse(user.user_metadata.onboarding_state)
      : {}

    const expedienteId = generateExpedienteId()
    const amountPaid = (session.amount_total || 0) / 100

    // Update expediente in DB
    await supabase.from('expedientes').update({
      payment_status: 'paid',
      status: 'en_revision',
      expediente_id: expedienteId,
      stripe_session_id: session.id,
      amount_paid: amountPaid,
      paid_at: new Date().toISOString(),
    }).eq('user_id', userId)

    const founderName = user?.user_metadata?.full_name || 'Founder'
    const founderEmail = user?.email || ''

    // Build cap table HTML
    const capTableRows = (onboardingData.capTable || [])
      .map((m: { nombre: string; rol: string; equity: number; contribucion: string; vesting: string }) => `| ${m.nombre} | ${m.rol} | ${m.equity}% | ${m.contribucion} | ${m.vesting} |`)
      .join('\n')

    const casoLabel: Record<string, string> = {
      CASO_1: 'CASO 1 — SAS simple',
      CASO_3: 'CASO 3 — SAS en DEZ + LEC',
      CASO_4: 'CASO 4 — Delaware + SAS en DEZ + LEC',
    }

    // Send internal notification to hello@anden.tech
    await resend.emails.send({
      from: 'Andén <noreply@anden.tech>',
      to: 'hello@anden.tech',
      subject: `Nuevo expediente — ${founderName} — ${casoLabel[caso] || caso} — ${new Date().toLocaleDateString('es-AR')}`,
      text: `
EXPEDIENTE ANDÉN #${expedienteId}
========================

DATOS DEL FOUNDER
Nombre: ${founderName}
Email: ${founderEmail}
Fecha de pago: ${new Date().toISOString()}
Monto pagado: USD ${amountPaid}
Modo seleccionado: ${advisorMode || 'solo'}

PERFIL DE LA EMPRESA
Actividad: ${onboardingData.actividad || '—'}
Etapa: ${onboardingData.etapa || '—'}
Mercado: ${onboardingData.mercado || '—'}
Moneda: ${onboardingData.moneda || '—'}
Empleados: ${onboardingData.empleados || '—'}
IP pre-existente: ${onboardingData.ipPreexistente || '—'}
Nombre elegido: ${onboardingData.nombreEmpresa || '—'}

CASO RECOMENDADO
${casoLabel[caso] || caso}
Elegibilidad LEC: ${onboardingData.lecStatus || '—'}

CAP TABLE
| Nombre | Rol | Equity | Contribución | Vesting |
|--------|-----|--------|-------------|---------|
${capTableRows}

NOTAS ESPECIALES
IP Assignment requerido: ${onboardingData.ipPreexistente !== 'no' ? 'SÍ' : 'No'}
Co-founders en exterior: ${onboardingData.ubicacionEquipo === 'cofunder_exterior' ? 'SÍ' : 'No'}
Term sheet existente: ${onboardingData.inversion === 'term_sheet' ? 'SÍ' : 'No'}
Inversión planificada: ${onboardingData.inversion || '—'}
`,
    })

    // Send confirmation to founder
    await resend.emails.send({
      from: 'Andén <noreply@anden.tech>',
      to: founderEmail,
      subject: `Tu expediente Andén — #${expedienteId}`,
      text: `
Hola ${founderName},

Tu pago fue recibido y tu expediente está en manos de nuestro equipo.

EXPEDIENTE: #${expedienteId}
ESTRUCTURA: ${casoLabel[caso] || caso}
MONTO PAGADO: USD ${amountPaid}

¿QUÉ SIGUE?
Nuestro equipo revisará tu expediente en las próximas 24 horas hábiles y se pondrá en contacto con vos.

Podés hacer seguimiento de todo el proceso en tu dashboard.

Tiempo estimado del proceso completo: 35–50 días hábiles.

Cualquier consulta: hello@anden.tech

El equipo de Andén
`,
    })
  }

  return NextResponse.json({ received: true })
}

// Required to receive raw body for Stripe webhook verification
export const dynamic = 'force-dynamic'
