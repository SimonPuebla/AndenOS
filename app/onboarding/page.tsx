'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useOnboardingStore } from '@/store/onboarding'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { ProfileSidebar } from '@/components/onboarding/ProfileSidebar'
import { QuestionCard } from '@/components/onboarding/QuestionCard'

// Steps definition: which block, question number (display), key in store, options
const STEPS = [
  {
    id: 'actividad',
    block: 'Bloque A — Actividad',
    displayNumber: 1,
    question: '¿A qué se dedica tu empresa?',
    options: [
      { value: 'software_saas_ia', label: 'Software / SaaS / IA', badge: 'LEC' },
      { value: 'crypto_web3_defi', label: 'Crypto / Web3 / DeFi', badge: 'LEC' },
      { value: 'produccion_audiovisual', label: 'Producción audiovisual', badge: 'LEC' },
      { value: 'biotecnologia', label: 'Biotecnología / Ciencias de la vida', badge: 'LEC' },
      { value: 'servicios_profesionales', label: 'Servicios profesionales de exportación', badge: 'LEC' },
      { value: 'industria_4', label: 'Industria 4.0 / Automatización / IoT', badge: 'LEC' },
      { value: 'nanotecnologia', label: 'Nanotecnología / Aeroespacial / Nuclear', badge: 'LEC' },
      { value: 'otra', label: 'Otra actividad' },
    ],
  },
  {
    id: 'porcentajeFacturacion',
    block: 'Bloque A — Actividad',
    displayNumber: 2,
    question: '¿Qué porcentaje de tu facturación viene de esa actividad?',
    subtitle: 'Solo aplica si ya tenés ingresos.',
    options: [
      { value: '70_plus', label: '70% o más', badge: 'Ideal' },
      { value: '40_70', label: 'Entre 40% y 70%' },
      { value: 'menos_40', label: 'Menos del 40%', desc: 'Podría no calificar para LEC' },
      { value: 'sin_facturacion', label: 'Sin facturación todavía', desc: 'Pre-revenue' },
    ],
  },
  {
    id: 'cantidadFounders',
    block: 'Bloque B — Equipo',
    displayNumber: 3,
    question: '¿Cuántos founders tiene la empresa?',
    options: [
      { value: 'solo_yo', label: 'Solo yo' },
      { value: 'dos', label: '2 founders' },
      { value: 'tres_plus', label: '3 o más founders' },
    ],
  },
  {
    id: 'ubicacionEquipo',
    block: 'Bloque B — Equipo',
    displayNumber: 4,
    question: '¿Dónde está el equipo?',
    options: [
      { value: 'todos_argentina', label: 'Todos en Argentina' },
      { value: 'cofunder_exterior', label: 'Algún co-founder en el exterior' },
      { value: 'todos_exterior', label: 'Todos fuera de Argentina' },
    ],
  },
  {
    id: 'etapa',
    block: 'Bloque B — Equipo',
    displayNumber: 5,
    question: '¿En qué etapa está el proyecto?',
    options: [
      { value: 'idea', label: 'Idea / Pre-producto' },
      { value: 'mvp', label: 'MVP en desarrollo' },
      { value: 'primeros_clientes', label: 'Primeros clientes' },
      { value: 'creciendo', label: 'Creciendo / Buscando inversión' },
    ],
  },
  {
    id: 'mercado',
    block: 'Bloque C — Capital y mercado',
    displayNumber: 6,
    question: '¿Dónde están tus clientes o mercado objetivo?',
    options: [
      { value: 'argentina', label: 'Argentina' },
      { value: 'latam', label: 'LATAM' },
      { value: 'eeuu_europa', label: 'EE.UU. / Europa' },
      { value: 'global', label: 'Global' },
    ],
  },
  {
    id: 'inversion',
    block: 'Bloque C — Capital y mercado',
    displayNumber: 7,
    question: '¿Planeás levantar inversión externa?',
    options: [
      { value: 'no_por_ahora', label: 'No por ahora' },
      { value: 'angels_familia', label: 'Angels / Familia' },
      { value: 'vcs_locales', label: 'VCs locales o LATAM' },
      { value: 'vcs_globales', label: 'VCs globales (EE.UU. / Europa)', badge: 'Delaware' },
      { value: 'term_sheet', label: 'Ya tengo term sheet', badge: 'Urgente' },
    ],
  },
  {
    id: 'moneda',
    block: 'Bloque C — Capital y mercado',
    displayNumber: 8,
    question: '¿En qué moneda operás o esperás operar?',
    options: [
      { value: 'ars', label: 'ARS (pesos argentinos)' },
      { value: 'usd', label: 'USD (dólares)' },
      { value: 'crypto', label: 'Crypto / USDC' },
      { value: 'mixto', label: 'Mixto' },
    ],
  },
  {
    id: 'empleados',
    block: 'Bloque D — Operación y compliance',
    displayNumber: 9,
    question: '¿Tenés o planeás tener empleados registrados?',
    options: [
      { value: 'solo_fundadores', label: 'Solo los fundadores' },
      { value: '1_3_pronto', label: '1–3 empleados pronto' },
      { value: 'mas_de_3', label: 'Más de 3 empleados' },
    ],
  },
  {
    id: 'ipPreexistente',
    block: 'Bloque D — Operación y compliance',
    displayNumber: 10,
    question: '¿Hay IP, código o activos pre-existentes que entrarán a la empresa?',
    subtitle: 'Esto determina si se necesita un IP Assignment Agreement.',
    options: [
      { value: 'no', label: 'No, todo se desarrolla dentro de la empresa' },
      { value: 'codigo', label: 'Sí — código / desarrollo pre-existente' },
      { value: 'marca_dominio', label: 'Sí — marca / dominio' },
      { value: 'varias', label: 'Sí — varias cosas' },
    ],
  },
  {
    id: 'nombreEmpresa',
    block: 'Bloque D — Operación y compliance',
    displayNumber: 11,
    question: '¿Ya tienen nombre de empresa elegido?',
    options: [
      { value: 'si_chequeado', label: 'Sí y chequeamos disponibilidad en IGJ' },
      { value: 'si_no_chequeado', label: 'Sí, pero no verificamos disponibilidad' },
      { value: 'todavia_no', label: 'Todavía no decidimos' },
    ],
  },
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'existing' ? 'existing' : 'new'

  const store = useOnboardingStore()
  const { currentStep, nextStep, prevStep, setMode } = store

  useEffect(() => {
    setMode(mode)
  }, [mode, setMode])

  const totalSteps = STEPS.length
  const step = STEPS[currentStep]

  const getCurrentValue = (): string | undefined => {
    if (!step) return undefined
    return (store as unknown as Record<string, unknown>)[step.id] as string | undefined
  }

  const handleSelect = (value: string) => {
    if (!step) return
    const setters: Record<string, (v: string) => void> = {
      actividad: store.setActividad as (v: string) => void,
      porcentajeFacturacion: store.setPorcentajeFacturacion as (v: string) => void,
      cantidadFounders: store.setCantidadFounders as (v: string) => void,
      ubicacionEquipo: store.setUbicacionEquipo as (v: string) => void,
      etapa: store.setEtapa as (v: string) => void,
      mercado: store.setMercado as (v: string) => void,
      inversion: store.setInversion as (v: string) => void,
      moneda: store.setMoneda as (v: string) => void,
      empleados: store.setEmpleados as (v: string) => void,
      ipPreexistente: store.setIpPreexistente as (v: string) => void,
      nombreEmpresa: store.setNombreEmpresa as (v: string) => void,
    }
    setters[step.id]?.(value)

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        nextStep()
      } else {
        router.push('/onboarding/captable')
      }
    }, 200)
  }

  const handleBack = () => {
    if (currentStep === 0) {
      router.push('/')
    } else {
      prevStep()
    }
  }

  // If past last step, redirect to captable
  if (currentStep >= totalSteps) {
    router.push('/onboarding/captable')
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b-2 border-dark bg-cream sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-xl tracking-tight">
            ANDÉN<span className="text-orange">.</span>
          </Link>
          <div className="w-64 hidden md:block">
            <ProgressBar current={currentStep + 1} total={totalSteps} label="Diagnóstico" />
          </div>
          <div className="font-mono text-xs text-dark/40 hidden md:block">
            Gratis · Sin compromiso
          </div>
        </div>
      </nav>

      {/* Mobile progress */}
      <div className="md:hidden border-b border-dark/10 bg-cream px-4 py-2">
        <ProgressBar current={currentStep + 1} total={totalSteps} label="Diagnóstico" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-[1fr_280px] gap-8 lg:gap-12">
          {/* Main question */}
          <div>
            {step && (
              <QuestionCard
                stepNumber={step.displayNumber}
                block={step.block}
                question={step.question}
                subtitle={step.subtitle}
                options={step.options}
                selected={getCurrentValue()}
                onSelect={handleSelect}
                onBack={handleBack}
              />
            )}

            {/* Profile summary transition — shown at last step */}
            {currentStep === totalSteps - 1 && store.nombreEmpresa && (
              <div className="mt-8 p-4 border-2 border-orange bg-orange/5">
                <div className="font-mono text-xs font-bold text-dark mb-2">
                  DIAGNÓSTICO CASI LISTO
                </div>
                <p className="font-sans text-sm text-dark/70">
                  Al confirmar esta respuesta pasarás al armado del cap table.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden md:block">
            <ProfileSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="font-mono text-dark/40">Cargando...</div></div>}>
      <OnboardingContent />
    </Suspense>
  )
}
