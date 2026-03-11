'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Lock } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { createClient } from '@/lib/supabase/client'

export default function PagoPage() {
  const router = useRouter()
  const store = useOnboardingStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)

  const caso = store.structureSelected || store.casoRecomendado || 'CASO_3'
  const priceBase = caso === 'CASO_4' ? 1500 : caso === 'CASO_1' ? 300 : 600
  const priceAdvisor = store.advisorMode === 'asesor' ? 290 : 0
  const totalPrice = priceBase + priceAdvisor

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/onboarding/registro')
        return
      }
      setUser({ email: data.user.email, id: data.user.id })
    }
    checkAuth()
  }, [router])

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caso,
          advisorMode: store.advisorMode,
          userEmail: user?.email,
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al iniciar el pago')
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

  const advisorMode = store.advisorMode

  const includes = [
    caso === 'CASO_4' ? 'Delaware C-Corp (HoldCo)' : null,
    caso === 'CASO_4' ? 'Estructura HoldCo / OpCo' : null,
    caso === 'CASO_4' ? 'Certificate of Incorporation' : null,
    caso === 'CASO_4' ? 'SAFE template + Intercompany Agreement' : null,
    'Constitución SAS en IGJ',
    'Inscripción Zona Franca Digital Mendoza',
    store.lecStatus !== 'no_lec' ? 'Inscripción LEC (MINCYT)' : null,
    'Founders Agreement' + (store.capTable.length > 1 ? '' : ' (si aplica)'),
    store.ipAssignmentRequired ? 'IP Assignment Agreement' : null,
    'Todos los documentos legales',
    'Seguimiento en dashboard en tiempo real',
    advisorMode === 'asesor' ? 'Asesor humano dedicado' : null,
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Nav */}
      <nav className="border-b-2 border-dark bg-cream">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-xl tracking-tight">
            ANDÉN<span className="text-orange">.</span>
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs text-dark/40">
            <Lock className="w-3.5 h-3.5" />
            Pago seguro
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-8">
          <div className="font-mono text-xs text-orange uppercase tracking-wider mb-2">
            Último paso
          </div>
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-dark mb-3">
            Tu expediente está listo.
          </h1>
          <p className="font-sans text-dark/60">
            Para que nuestro equipo inicie el proceso, completá el pago.
          </p>
        </div>

        {/* Price card */}
        <div className="bg-dark text-cream border-2 border-dark shadow-[4px_4px_0px_#F89A2F] p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="font-mono text-sm text-cream/50 mb-1">
                {caso === 'CASO_4' ? 'Delaware + SAS en DEZ + LEC' : caso === 'CASO_1' ? 'SAS simple' : 'SAS en DEZ + LEC'}
              </div>
              <div className="font-mono text-4xl font-bold">
                USD {totalPrice}
              </div>
              <div className="font-mono text-xs text-cream/40 mt-1">Pago único · Sin costos recurrentes</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-cream/40">Tiempo estimado</div>
              <div className="font-mono text-lg font-bold mt-1">
                {caso === 'CASO_4' ? '42' : '40'} días
              </div>
            </div>
          </div>

          <div className="border-t border-cream/10 pt-4 mb-6">
            <div className="grid grid-cols-1 gap-2">
              {includes.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange border border-orange flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-dark" />
                  </div>
                  <span className="font-sans text-sm text-cream/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {priceAdvisor > 0 && (
            <div className="flex justify-between text-sm font-sans text-cream/60 mb-2">
              <span>Proceso {caso === 'CASO_4' ? 'Delaware + SAS + LEC' : 'SAS + LEC'}</span>
              <span>USD {priceBase}</span>
            </div>
          )}
          {priceAdvisor > 0 && (
            <div className="flex justify-between text-sm font-sans text-cream/60 mb-2">
              <span>Asesor humano dedicado</span>
              <span>USD {priceAdvisor}</span>
            </div>
          )}
        </div>

        {/* Payment button */}
        {error && (
          <div className="p-3 border-2 border-red-400 bg-red-50 mb-4">
            <p className="font-sans text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading || !user}
          className="w-full btn-primary text-center text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Redirigiendo...' : `Pagar USD ${totalPrice} →`}
        </button>

        <div className="flex items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-1.5 font-mono text-xs text-dark/40">
            <Lock className="w-3 h-3" />
            Stripe Checkout seguro
          </div>
          <div className="font-mono text-xs text-dark/40">·</div>
          <div className="font-mono text-xs text-dark/40">
            {user?.email}
          </div>
        </div>

        <p className="font-sans text-xs text-dark/40 text-center mt-4">
          Al completar el pago, nuestro equipo recibe tu expediente y se contacta dentro de las 24hs hábiles.
        </p>
      </div>
    </div>
  )
}
