'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TIER_LABELS } from '@/types/agent'
import { Lock } from 'lucide-react'

interface AgentExpedient {
  id: string
  status: string
  tier: string
  scenario: number
  is_founding_member: boolean
  limit_per_tx: number
  limit_daily: number
  limit_monthly: number
  allowed_assets: string[]
  prohibited_assets: string
  override_conditions: string[]
  override_drop_pct: number
  override_tx_threshold: number
  beneficiary_type: string
  agent_function: string
  amount_paid: number
}

function AgentDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const [expedient, setExpedient] = useState<AgentExpedient | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, unknown> } | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) { router.push('/agents/registro'); return }
      setUser(user)

      const { data } = await supabase
        .from('agent_expedients')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!data) { router.push('/agents/registro/pago'); return }
      setExpedient(data)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-cream/30">Cargando expediente...</div>
      </div>
    )
  }
  if (!expedient) return null

  const tierLabel = TIER_LABELS[expedient.tier as keyof typeof TIER_LABELS] ?? expedient.tier
  const founderName = (user?.user_metadata?.full_name as string) || ''
  const sfId = `SF-${new Date().getFullYear()}-${expedient.id.slice(0, 4).toUpperCase()}`

  const docs = [
    { label: 'Contrato de fideicomiso (instrumento jurídico off-chain)', status: 'generating' },
    { label: 'Smart contracts (mecanismo de ejecución on-chain)', status: 'generating' },
    { label: 'Registro IDITS — Zona Digital Mendoza', status: 'generating' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Payment banner */}
      {paymentSuccess && (
        <div className="border border-cyan/40 bg-cyan/5 mb-8 p-4 text-center">
          <div className="font-mono text-sm text-cyan font-bold">Pago recibido. Tu Smart Fiduciae está en manos del equipo Andén.</div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <div className="font-mono text-xs text-cyan/40 mb-1">
          SMART FIDUCIAE #{sfId} · {tierLabel.toUpperCase()} · Escenario 2 · Founding Member ⭐
        </div>
        <h1 className="font-mono text-2xl md:text-3xl font-bold text-cream">
          {founderName ? `Hola, ${founderName.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <div className="mt-3 border border-cream/10 p-4">
          <div className="font-mono text-xs text-cream/40 mb-1">ESTADO</div>
          <div className="font-mono text-sm text-cream">En revisión por el equipo Andén</div>
          <div className="font-sans text-xs text-cream/30 mt-1">
            El equipo te contactará en las próximas 48hs a {user?.email}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Docs */}
          <div className="agent-card">
            <div className="agent-label mb-4">Documentos</div>
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.label} className="flex items-center gap-3 p-3 border border-cream/10">
                  <div className="w-6 h-6 border border-cream/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-3 h-3 text-cream/20" />
                  </div>
                  <span className="font-sans text-sm text-cream/40 flex-1">{doc.label}</span>
                  <span className="font-mono text-xs text-cream/20 border border-cream/10 px-2 py-0.5">En generación</span>
                </div>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="agent-card">
            <div className="agent-label mb-4">Parámetros definidos</div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="font-mono text-xs text-cyan/40 mb-1">POR TRANSACCIÓN</div>
                <div className="font-mono text-sm text-cream">USD {expedient.limit_per_tx?.toLocaleString() ?? '—'}</div>
              </div>
              <div>
                <div className="font-mono text-xs text-cyan/40 mb-1">DIARIO</div>
                <div className="font-mono text-sm text-cream">USD {expedient.limit_daily?.toLocaleString() ?? '—'}</div>
              </div>
              <div>
                <div className="font-mono text-xs text-cyan/40 mb-1">MENSUAL</div>
                <div className="font-mono text-sm text-cream">USD {expedient.limit_monthly?.toLocaleString() ?? '—'}</div>
              </div>
            </div>
            {expedient.allowed_assets?.length > 0 && (
              <div className="mb-3">
                <div className="font-mono text-xs text-cyan/40 mb-1">ACTIVOS PERMITIDOS</div>
                <div className="font-sans text-sm text-cream/60">{expedient.allowed_assets.join(', ')}</div>
              </div>
            )}
            {expedient.override_conditions?.length > 0 && (
              <div>
                <div className="font-mono text-xs text-cyan/40 mb-2">CONDICIONES DE OVERRIDE</div>
                <ul className="space-y-1">
                  {expedient.override_conditions.map((c) => (
                    <li key={c} className="font-sans text-xs text-cream/40 flex gap-2"><span className="text-cyan/30">·</span>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Founding Member */}
          <div className="agent-card border-cyan/30">
            <div className="font-mono text-xs text-cyan mb-3">⭐ FOUNDING MEMBER</div>
            <p className="font-sans text-sm text-cream/50 leading-relaxed mb-3">
              Sos founding member de la Zona Digital Mendoza. Tu agente será parte del primer sandbox de IA con respaldo jurídico real.
            </p>
            <ul className="space-y-1.5">
              {[
                `Precio bloqueado al tier ${tierLabel}`,
                'Acceso prioritario al Escenario 2',
                'Participás en el diseño del sandbox regulatorio',
              ].map((i) => (
                <li key={i} className="font-sans text-xs text-cream/40 flex gap-2"><span className="text-cyan">·</span>{i}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="agent-card">
            <div className="agent-label mb-3">Contacto</div>
            <a
              href={`mailto:hello@anden.tech?subject=Smart Fiduciae #${sfId} — Consulta`}
              className="agent-btn-secondary w-full text-center block text-sm py-2"
            >
              Hablar con mi asesor →
            </a>
            <p className="font-mono text-xs text-cream/20 text-center mt-2">hello@anden.tech</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="font-mono text-cream/30">Cargando...</div></div>}>
      <AgentDashboardContent />
    </Suspense>
  )
}
