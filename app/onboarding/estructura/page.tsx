'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useOnboardingStore } from '@/store/onboarding'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { OnboardingCase, AdvisorMode } from '@/types/onboarding'

interface StructureCardProps {
  caso: OnboardingCase
  title: string
  subtitle: string
  price: string
  timeline: string
  pros: string[]
  cons: string[]
  recommended?: boolean
  badge?: string
  onSelect: () => void
  selected: boolean
}

function StructureCard({ title, subtitle, price, timeline, pros, cons, recommended, badge, onSelect, selected }: StructureCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`border-2 transition-all ${
        selected
          ? 'border-orange shadow-[4px_4px_0px_#F89A2F] bg-orange/5'
          : recommended
          ? 'border-dark shadow-[4px_4px_0px_#1A1A2E]'
          : 'border-dark/30 shadow-none hover:border-dark'
      } bg-cream`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            {badge && (
              <div className={`tag mb-2 inline-block ${recommended ? 'bg-orange text-dark border-orange' : 'bg-cream text-dark border-dark/30'}`}>
                {badge}
              </div>
            )}
            <h3 className="font-mono text-lg font-bold">{title}</h3>
            <p className="font-sans text-sm text-dark/60 mt-1">{subtitle}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-mono text-xl font-bold">{price}</div>
            <div className="font-mono text-xs text-dark/40">{timeline}</div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between font-mono text-xs text-dark/50 hover:text-dark transition-colors mt-3 pt-3 border-t border-dark/10"
        >
          Ver detalle
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {expanded && (
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <div className="font-mono text-xs font-bold text-dark mb-2">VENTAJAS</div>
              <ul className="space-y-1">
                {pros.map((p) => (
                  <li key={p} className="flex items-start gap-2 font-sans text-xs text-dark/70">
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-dark mb-2">LIMITACIONES</div>
              <ul className="space-y-1">
                {cons.map((c) => (
                  <li key={c} className="flex items-start gap-2 font-sans text-xs text-dark/70">
                    <span className="text-red-400 flex-shrink-0 font-bold">—</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={onSelect}
          className={`w-full py-2.5 border-2 font-mono text-sm font-bold transition-all ${
            selected
              ? 'bg-orange border-dark text-dark shadow-[2px_2px_0px_#1A1A2E]'
              : 'bg-cream border-dark text-dark hover:bg-dark hover:text-cream shadow-[2px_2px_0px_#1A1A2E] hover:shadow-none'
          }`}
        >
          {selected ? '✓ Seleccionado' : 'Seleccionar esta estructura'}
        </button>
      </div>
    </div>
  )
}

const STRUCTURES = {
  CASO_3: {
    title: 'SAS en DEZ + LEC',
    subtitle: 'Sociedad por Acciones Simplificada en Zona Franca Digital de Mendoza con inscripción en Ley de Economía del Conocimiento.',
    price: 'USD 490',
    timeline: '35–50 días',
    pros: [
      'Beneficios fiscales LEC: -60% ganancias, bono 70% contrib.',
      'Sin retenciones IVA en exportaciones',
      'Domicilio en Zona Franca Digital',
      'Constitución rápida y económica',
      'Ideal para software, SaaS, servicios digitales',
    ],
    cons: [
      'Limitaciones para inversión de VCs globales',
      'No acepta participantes personas jurídicas extranjeras',
      'Levantamiento de capital más complejo',
    ],
  },
  CASO_4: {
    title: 'Delaware + SAS en DEZ + LEC',
    subtitle: 'Estructura dual: C-Corp en Delaware (HoldCo) + SAS en Argentina (OpCo). Acceso a capital global con beneficios fiscales locales.',
    price: 'USD 890',
    timeline: '35–50 días (paralelo)',
    pros: [
      'Estructura estándar para VCs de EE.UU./Europa',
      'Levantamiento de capital con SAFE o equity estándar',
      'Retiene beneficios LEC en Argentina',
      'Separación HoldCo/OpCo protege activos',
      'SAFE template incluido',
    ],
    cons: [
      'Mayor costo inicial',
      'Dos entidades para mantener',
      'Reporte fiscal en dos jurisdicciones',
    ],
  },
  CASO_1: {
    title: 'SAS simple (sin LEC)',
    subtitle: 'Sociedad por Acciones Simplificada sin inscripción en LEC. Estructura básica para empresas que no califican o no necesitan los beneficios.',
    price: 'USD 490',
    timeline: '20–30 días',
    pros: [
      'Proceso más rápido y simple',
      'Sin requisitos de actividad LEC',
      'Menor carga de compliance',
    ],
    cons: [
      'Sin beneficios fiscales LEC',
      'Sin acceso a bono de crédito fiscal',
      'Carga impositiva completa',
    ],
  },
}

const ADVISOR_OPTIONS: { value: AdvisorMode; label: string; desc: string; price: string }[] = [
  {
    value: 'ai',
    label: 'Con guía Andén',
    desc: 'El sistema te guía en cada paso. Nuestro equipo gestiona el proceso sin intervención adicional.',
    price: 'Incluido',
  },
  {
    value: 'solo',
    label: 'Proceso estándar',
    desc: 'Andén gestiona todo. Vos hacés seguimiento en el dashboard.',
    price: 'Incluido',
  },
  {
    value: 'asesor',
    label: 'Con asesor humano dedicado',
    desc: 'Un abogado especializado te acompaña durante todo el proceso. Reuniones disponibles.',
    price: '+USD 290',
  },
]

export default function EstructuraPage() {
  const router = useRouter()
  const {
    casoRecomendado,
    lecStatus,
    structureSelected,
    setStructureSelected,
    advisorMode,
    setAdvisorMode,
    cofounderExterior,
    ipAssignmentRequired,
  } = useOnboardingStore()

  const recommended = casoRecomendado || 'CASO_3'
  const selected = structureSelected || recommended

  const canContinue = !!selected && !!advisorMode

  const getStructuresForCase = (): OnboardingCase[] => {
    if (casoRecomendado === 'CASO_4') return ['CASO_4', 'CASO_3', 'CASO_1']
    if (casoRecomendado === 'CASO_3') return ['CASO_3', 'CASO_4', 'CASO_1']
    return ['CASO_1', 'CASO_3', 'CASO_4']
  }

  const orderedCases = getStructuresForCase()

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b-2 border-dark bg-cream sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-xl tracking-tight">
            ANDÉN<span className="text-orange">.</span>
          </Link>
          <div className="w-64 hidden md:block">
            <ProgressBar current={3} total={5} label="Estructura" />
          </div>
          <div className="font-mono text-xs text-dark/40 hidden md:block">Paso 3 de 5</div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-2">
          <div className="font-mono text-xs text-orange uppercase tracking-wider mb-2">Paso 3 — Estructura</div>
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-dark mb-3">
            Tu estructura recomendada
          </h1>
          <p className="font-sans text-dark/60 mb-6">
            Basándonos en tu perfil, esta es la estructura óptima para tu empresa.
          </p>
        </div>

        {/* LEC status banner */}
        {lecStatus && (
          <div className={`p-4 border-2 mb-6 ${
            lecStatus === 'eligible' ? 'border-green-500 bg-green-50' :
            lecStatus === 'ruta_express' ? 'border-orange bg-orange/10' :
            'border-dark/20 bg-dark/5'
          }`}>
            <div className="font-mono text-xs font-bold mb-1">
              {lecStatus === 'eligible' && 'ELEGIBLE PARA LEC'}
              {lecStatus === 'ruta_express' && 'RUTA EXPRESS LEC — ART. 6°'}
              {lecStatus === 'no_lec' && 'SIN ELEGIBILIDAD LEC'}
            </div>
            <p className="font-sans text-sm text-dark/70">
              {lecStatus === 'eligible' && 'Tu actividad califica para los beneficios de la Ley de Economía del Conocimiento.'}
              {lecStatus === 'ruta_express' && 'Como empresa pre-revenue en etapa temprana, accedés a la ruta express de inscripción LEC (Art. 6°, microempresas de hasta 3 años).'}
              {lecStatus === 'no_lec' && 'Tu actividad principal no califica para los beneficios LEC. Podés constituir igual y revisar en el futuro.'}
            </p>
          </div>
        )}

        {/* Warnings */}
        {cofounderExterior && (
          <div className="p-4 border-2 border-orange bg-orange/10 mb-4">
            <div className="font-mono text-xs font-bold mb-1">CO-FOUNDER EN EL EXTERIOR</div>
            <p className="font-sans text-sm text-dark/70">
              Las SAS no pueden tener personas jurídicas extranjeras como accionistas. Si tu co-founder es persona física extranjera, sí puede participar. Lo evaluamos en detalle durante el proceso.
            </p>
          </div>
        )}

        {ipAssignmentRequired && (
          <div className="p-4 border-2 border-blue bg-blue/5 mb-4">
            <div className="font-mono text-xs font-bold text-blue mb-1">IP ASSIGNMENT REQUERIDO</div>
            <p className="font-sans text-sm text-dark/70">
              Tenés activos pre-existentes. Se generará un IP Assignment Agreement para transferir estos activos a la empresa. Está incluido en el proceso.
            </p>
          </div>
        )}

        {/* Structures */}
        <div className="space-y-4 mb-8">
          {orderedCases.map((caso) => {
            const structure = STRUCTURES[caso as keyof typeof STRUCTURES]
            if (!structure) return null
            return (
              <StructureCard
                key={caso}
                caso={caso}
                {...structure}
                recommended={caso === recommended}
                badge={caso === recommended ? 'Recomendado para vos' : undefined}
                selected={selected === caso}
                onSelect={() => setStructureSelected(caso)}
              />
            )
          })}
        </div>

        {/* Advisor mode */}
        <div className="mb-8">
          <h2 className="font-mono text-lg font-bold mb-4">Modo de acompañamiento</h2>
          <div className="grid gap-3">
            {ADVISOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAdvisorMode(opt.value)}
                className={`text-left p-4 border-2 transition-all ${
                  advisorMode === opt.value
                    ? 'border-orange bg-orange/10 shadow-[2px_2px_0px_#F89A2F]'
                    : 'border-dark/30 bg-cream hover:border-dark'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${advisorMode === opt.value ? 'border-orange bg-orange' : 'border-dark'}`}>
                      {advisorMode === opt.value && <div className="w-2 h-2 bg-dark" />}
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold">{opt.label}</div>
                      <div className="font-sans text-xs text-dark/60 mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                  <div className={`font-mono text-sm font-bold flex-shrink-0 ${opt.price === 'Incluido' ? 'text-green-600' : 'text-dark'}`}>
                    {opt.price}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => router.back()} className="btn-secondary">
            ← Volver
          </button>
          <button
            onClick={() => router.push('/onboarding/proceso')}
            disabled={!canContinue}
            className={`flex-1 font-mono font-bold px-6 py-3 border-2 transition-all duration-100 text-center ${
              canContinue
                ? 'bg-orange text-dark border-dark shadow-[4px_4px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer'
                : 'bg-dark/10 text-dark/30 border-dark/20 cursor-not-allowed'
            }`}
          >
            Ver el proceso detallado →
          </button>
        </div>
      </div>
    </div>
  )
}
