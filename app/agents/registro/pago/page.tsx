'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agent'
import { TIER_PRICES, TIER_LABELS } from '@/types/agent'
import { createClient } from '@/lib/supabase/client'

export default function AgentPagoPage() {
  const router = useRouter()
  const store = useAgentStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!data.user) { router.push('/agents/registro'); return }
      setUser({ email: data.user.email })
    }
    checkAuth()
  }, [router])

  const { tier } = store
  const prices = TIER_PRICES[tier]

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/agent-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      if (!response.ok) {
        const d = await response.json()
        throw new Error(d.error || 'Error al iniciar el pago')
      }
      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      const e = err as { message?: string }
      setError(e.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const mailtoBody = encodeURIComponent(
    `Hola equipo Andén,\n\nQuiero hablar antes de proceder al pago.\n\nTier: ${TIER_LABELS[tier]}\nEmail: ${user?.email || ''}\n\nConsulta:`
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="agent-label mb-3">Último paso</div>
      <h1 className="font-mono text-3xl font-bold text-cream mb-8">Tu Smart Fiduciae está listo para iniciar.</h1>

      <div className="border border-cyan/20 p-6 mb-6">
        <div className="font-mono text-xs text-cream/40 mb-1">{TIER_LABELS[tier].toUpperCase()} — SETUP</div>
        <div className="font-mono text-4xl font-bold text-cyan mb-4">USD {prices.setup.toLocaleString()}</div>
        <ul className="space-y-2">
          {[
            'Contrato de fideicomiso con administración algorítmica',
            'Definición de parámetros y límites transaccionales',
            'Andén como fiduciario — titularidad, supervisión y override',
            'Registro en Zona Digital Mendoza (Escenario 2 cuando esté disponible)',
            'Dashboard de monitoreo del patrimonio',
            'Status de Founding Member ⭐',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 font-sans text-sm text-cream/60">
              <span className="text-cyan">✓</span> {item}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="border border-orange/40 bg-orange/5 p-3 mb-4">
          <p className="font-sans text-sm text-orange/80">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePay}
          disabled={loading || !user}
          className="flex-1 agent-btn text-center py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Redirigiendo...' : `Pagar setup USD ${prices.setup.toLocaleString()} →`}
        </button>
        <a
          href={`mailto:hello@anden.tech?subject=Smart Fiduciae — Consulta previa — ${TIER_LABELS[tier]}&body=${mailtoBody}`}
          className="agent-btn-secondary text-center py-4 sm:w-auto"
        >
          Hablar con el equipo →
        </a>
      </div>
      <p className="font-mono text-xs text-cream/20 text-center mt-4">{user?.email}</p>
    </div>
  )
}
