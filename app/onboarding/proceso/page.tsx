'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, Building2, User, Globe } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { ProgressBar } from '@/components/onboarding/ProgressBar'

interface ProcessStep {
  number: string
  name: string
  days: number
  accumulated: number
  actor: 'founder' | 'anden' | 'organismo'
  institution: string
  docs: string[]
  detail: string
  parallel?: boolean
  branch?: 'ar' | 'de'
}

const CASO_3_STEPS: ProcessStep[] = [
  {
    number: '01',
    name: 'Diagnóstico y documentación inicial',
    days: 2,
    accumulated: 2,
    actor: 'anden',
    institution: 'Andén',
    docs: ['Resumen de perfil', 'Lista de documentos requeridos'],
    detail: 'Andén revisa tu perfil, valida la elegibilidad LEC y prepara el expediente inicial con todos los datos del diagnóstico y cap table.',
  },
  {
    number: '02',
    name: 'Elaboración del estatuto SAS',
    days: 3,
    accumulated: 5,
    actor: 'anden',
    institution: 'Andén (estudio jurídico)',
    docs: ['Borrador de estatuto SAS', 'Acta constitutiva'],
    detail: 'El equipo jurídico elabora el estatuto de la SAS con el objeto social apropiado para LEC, las cláusulas de vesting y el cap table definido.',
  },
  {
    number: '03',
    name: 'Reserva de nombre y presentación IGJ',
    days: 5,
    accumulated: 10,
    actor: 'anden',
    institution: 'IGJ (Inspección General de Justicia)',
    docs: ['Formulario de reserva de nombre', 'Estatuto firmado'],
    detail: 'Se reserva el nombre en IGJ y se presenta el estatuto para inscripción. IGJ puede solicitar observaciones en este período.',
  },
  {
    number: '04',
    name: 'Obtención de CUIT provisorio',
    days: 3,
    accumulated: 13,
    actor: 'anden',
    institution: 'AFIP / ARCA',
    docs: ['Formulario AFIP 420/J', 'CUIT provisorio'],
    detail: 'Con el estatuto en trámite se gestiona el CUIT provisorio ante ARCA (ex AFIP) para poder operar mientras se completa la inscripción registral.',
  },
  {
    number: '05',
    name: 'Inscripción en Zona Franca Digital Mendoza',
    days: 10,
    accumulated: 23,
    actor: 'anden',
    institution: 'Zona Franca Mendoza S.A.',
    docs: ['Solicitud de adhesión ZFM', 'Estatuto inscripto', 'Formulario ZF-01'],
    detail: 'Se presenta la solicitud de adhesión a la Zona Franca Digital de Mendoza. La empresa obtiene domicilio en zona franca y queda habilitada para operar bajo ese régimen.',
  },
  {
    number: '06',
    name: 'Inscripción LEC — MINCYT',
    days: 12,
    accumulated: 35,
    actor: 'anden',
    institution: 'MINCYT / Secretaría de Economía del Conocimiento',
    docs: ['Formulario de inscripción LEC', 'Declaración de actividades promovidas', 'Estados contables (si aplica)'],
    detail: 'Se presenta la solicitud de inscripción en el Registro Nacional de Beneficiarios de la LEC ante el MINCYT. Este paso habilita los beneficios fiscales.',
  },
  {
    number: '07',
    name: 'CUIT definitivo e inicio de operaciones',
    days: 5,
    accumulated: 40,
    actor: 'founder',
    institution: 'ARCA + Banco',
    docs: ['CUIT definitivo', 'Alta en actividades económicas', 'Cuenta bancaria empresarial'],
    detail: 'Con la inscripción completa, se obtiene el CUIT definitivo, se dan de alta las actividades en ARCA y se abre la cuenta bancaria a nombre de la SAS.',
  },
]

const CASO_4_STEPS: ProcessStep[] = [
  {
    number: '01',
    name: 'Diagnóstico y documentación inicial',
    days: 2,
    accumulated: 2,
    actor: 'anden',
    institution: 'Andén',
    docs: ['Resumen de perfil', 'Lista de documentos requeridos'],
    detail: 'Andén revisa tu perfil y prepara los expedientes para ambas jurisdicciones: Delaware (HoldCo) y Argentina (OpCo).',
  },
  {
    number: '02A',
    name: '[DELAWARE] Incorporación C-Corp',
    days: 5,
    accumulated: 7,
    actor: 'anden',
    institution: 'Delaware Division of Corporations',
    docs: ['Certificate of Incorporation', 'Bylaws', 'Initial Board Resolutions'],
    detail: 'Se constituye la C-Corp en Delaware. Incluye Articles of Incorporation, Bylaws estándar para startups, y la estructura accionaria inicial.',
    parallel: true,
    branch: 'de',
  },
  {
    number: '02B',
    name: '[ARGENTINA] Estatuto SAS',
    days: 3,
    accumulated: 5,
    actor: 'anden',
    institution: 'Andén (estudio jurídico)',
    docs: ['Borrador de estatuto SAS', 'Acta constitutiva'],
    detail: 'Simultáneamente, el equipo jurídico elabora el estatuto de la SAS argentina con el objeto social apropiado para LEC.',
    parallel: true,
    branch: 'ar',
  },
  {
    number: '03A',
    name: '[DELAWARE] EIN y estructura accionaria',
    days: 5,
    accumulated: 12,
    actor: 'anden',
    institution: 'IRS / Registered Agent',
    docs: ['EIN (Tax ID)', 'Cap table Delaware', 'Stock certificates', 'SAFE template'],
    detail: 'Se obtiene el EIN ante el IRS, se formaliza la estructura accionaria y se preparan los documentos para levantar capital (SAFE o equity).',
    parallel: true,
    branch: 'de',
  },
  {
    number: '03B',
    name: '[ARGENTINA] Presentación IGJ',
    days: 8,
    accumulated: 13,
    actor: 'anden',
    institution: 'IGJ',
    docs: ['Formulario de reserva de nombre', 'Estatuto firmado'],
    detail: 'Se reserva el nombre y se presenta el estatuto de la SAS ante IGJ.',
    parallel: true,
    branch: 'ar',
  },
  {
    number: '04',
    name: 'Intercompany Agreement',
    days: 3,
    accumulated: 15,
    actor: 'anden',
    institution: 'Andén (estudio jurídico)',
    docs: ['Intercompany Agreement', 'IP License Agreement'],
    detail: 'Se redacta el acuerdo entre HoldCo (Delaware) y OpCo (Argentina) regulando la relación entre ambas entidades, la IP y los pagos intercompany.',
  },
  {
    number: '05',
    name: 'Inscripción Zona Franca Digital Mendoza',
    days: 10,
    accumulated: 25,
    actor: 'anden',
    institution: 'Zona Franca Mendoza S.A.',
    docs: ['Solicitud ZFM', 'Formulario ZF-01'],
    detail: 'La SAS argentina se inscribe en la Zona Franca Digital de Mendoza para obtener los beneficios del régimen.',
  },
  {
    number: '06',
    name: 'Inscripción LEC — MINCYT',
    days: 12,
    accumulated: 37,
    actor: 'anden',
    institution: 'MINCYT',
    docs: ['Formulario LEC', 'Declaración de actividades promovidas'],
    detail: 'Inscripción en el Registro Nacional de Beneficiarios de la Ley de Economía del Conocimiento.',
  },
  {
    number: '07',
    name: 'CUIT definitivo e inicio de operaciones',
    days: 5,
    accumulated: 42,
    actor: 'founder',
    institution: 'ARCA + Banco',
    docs: ['CUIT definitivo', 'Cuenta bancaria SAS'],
    detail: 'Con todo inscripto, se obtiene el CUIT definitivo y se abre la cuenta bancaria. La estructura está lista para operar.',
  },
]

const PARALLEL_ACTIONS = [
  { label: 'Abrir cuenta bancaria para la empresa', time: 'Semana 2', key: 'banco' },
  { label: 'Registrar el dominio y marca', time: 'Semana 1', key: 'dominio' },
  { label: 'Configurar herramientas: Stripe, Wise, etc.', time: 'Semana 1', key: 'tools' },
  { label: 'Preparar contrato con primer cliente', time: 'Semana 2', key: 'contrato' },
  { label: 'Verificar disponibilidad de nombre en IGJ', time: 'Inmediato', key: 'nombre' },
  { label: 'Reunión de alineación con co-founders', time: 'Semana 1', key: 'founders' },
]

const ACTOR_ICON = {
  founder: <User className="w-3.5 h-3.5" />,
  anden: <Building2 className="w-3.5 h-3.5" />,
  organismo: <Globe className="w-3.5 h-3.5" />,
}
const ACTOR_LABEL = {
  founder: 'Founder',
  anden: 'Andén',
  organismo: 'Organismo',
}
const ACTOR_COLOR = {
  founder: 'bg-blue text-cream',
  anden: 'bg-orange text-dark',
  organismo: 'bg-dark text-cream',
}

function StepRow({ step, defaultOpen = false }: { step: ProcessStep; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  const borderColor = step.branch === 'de' ? 'border-blue' : step.branch === 'ar' ? 'border-orange' : 'border-dark'

  return (
    <div className={`border-2 ${borderColor} bg-cream`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-start gap-4"
      >
        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-mono text-xs font-bold border ${borderColor} ${step.branch === 'de' ? 'bg-blue text-cream' : step.branch === 'ar' ? 'bg-orange text-dark' : 'bg-dark text-cream'}`}>
          {step.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-mono text-sm font-bold leading-tight">{step.name}</div>
            <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <div className={`tag text-xs flex items-center gap-1 ${ACTOR_COLOR[step.actor]}`}>
              {ACTOR_ICON[step.actor]}
              {ACTOR_LABEL[step.actor]}
            </div>
            <span className="font-mono text-xs text-dark/40">{step.days} días</span>
            <span className="font-mono text-xs text-dark/40">Día {step.accumulated}</span>
            <span className="font-mono text-xs text-dark/40 truncate">{step.institution}</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-dark/10 pt-4">
          <p className="font-sans text-sm text-dark/70 mb-3 leading-relaxed">{step.detail}</p>
          {step.docs.length > 0 && (
            <div>
              <div className="font-mono text-xs font-bold text-dark/50 mb-2">DOCUMENTOS</div>
              <ul className="space-y-1">
                {step.docs.map((doc) => (
                  <li key={doc} className="font-sans text-xs text-dark/60 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange flex-shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProcesoPage() {
  const router = useRouter()
  const { structureSelected, casoRecomendado, advisorMode } = useOnboardingStore()
  const [parallelChecked, setParallelChecked] = useState<Record<string, boolean>>({})

  const caso = structureSelected || casoRecomendado || 'CASO_3'
  const steps = caso === 'CASO_4' ? CASO_4_STEPS : CASO_3_STEPS
  const totalDays = steps[steps.length - 1]?.accumulated || 40

  const toggleParallel = (key: string) => {
    setParallelChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const priceBase = caso === 'CASO_4' ? 890 : 490
  const priceAdvisor = advisorMode === 'asesor' ? 290 : 0
  const totalPrice = priceBase + priceAdvisor

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b-2 border-dark bg-cream sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-xl tracking-tight">
            ANDÉN<span className="text-orange">.</span>
          </Link>
          <div className="w-64 hidden md:block">
            <ProgressBar current={4} total={5} label="Proceso" />
          </div>
          <div className="font-mono text-xs text-dark/40 hidden md:block">Paso 4 de 5</div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="font-mono text-xs text-orange uppercase tracking-wider mb-2">Paso 4 — Proceso</div>
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-dark mb-3">
            Tu proceso detallado
          </h1>
          <p className="font-sans text-dark/60 mb-4">
            {caso === 'CASO_4'
              ? 'Proceso en paralelo: Delaware y Argentina simultáneamente.'
              : 'Proceso secuencial en Argentina con LEC.'}
            {' '}Tiempo estimado: <strong>{totalDays} días hábiles</strong>.
          </p>

          {caso === 'CASO_4' && (
            <div className="flex gap-4 flex-wrap text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue border border-dark" />
                Delaware (HoldCo)
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange border border-dark" />
                Argentina (OpCo)
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-dark" />
                Compartido
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-2 mb-10">
          {steps.map((step, i) => (
            <StepRow key={step.number} step={step} defaultOpen={i === 0} />
          ))}
        </div>

        {/* Mientras esperás */}
        <div className="card mb-8">
          <h2 className="font-mono text-lg font-bold mb-4">Mientras esperás — acciones paralelas</h2>
          <p className="font-sans text-sm text-dark/60 mb-4">
            Estas tareas podés hacerlas vos mismo mientras Andén gestiona el proceso legal.
          </p>
          <div className="space-y-2">
            {PARALLEL_ACTIONS.map((action) => (
              <div
                key={action.key}
                className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                  parallelChecked[action.key]
                    ? 'border-dark/20 bg-dark/5'
                    : 'border-dark/20 hover:border-dark'
                }`}
                onClick={() => toggleParallel(action.key)}
              >
                <div className={`w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center ${parallelChecked[action.key] ? 'border-dark bg-dark' : 'border-dark'}`}>
                  {parallelChecked[action.key] && (
                    <span className="text-cream text-xs font-bold">✓</span>
                  )}
                </div>
                <div className="flex-1">
                  <span className={`font-sans text-sm ${parallelChecked[action.key] ? 'line-through text-dark/40' : 'text-dark'}`}>
                    {action.label}
                  </span>
                </div>
                <div className="font-mono text-xs text-dark/40 flex-shrink-0">{action.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Price summary */}
        <div className="card mb-8">
          <div className="label-mono text-dark/50 mb-4">Resumen del proceso</div>
          <div className="space-y-2">
            <div className="flex justify-between font-sans text-sm">
              <span>{caso === 'CASO_4' ? 'Delaware + SAS + LEC' : 'SAS + LEC'}</span>
              <span className="font-mono font-bold">USD {priceBase}</span>
            </div>
            {advisorMode === 'asesor' && (
              <div className="flex justify-between font-sans text-sm">
                <span>Asesor humano dedicado</span>
                <span className="font-mono font-bold">USD {priceAdvisor}</span>
              </div>
            )}
            <div className="border-t border-dark/10 pt-2 flex justify-between">
              <span className="font-mono font-bold">Total</span>
              <span className="font-mono text-xl font-bold text-orange">USD {totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => router.back()} className="btn-secondary">
            ← Volver
          </button>
          <button
            onClick={() => router.push('/onboarding/registro')}
            className="flex-1 btn-primary text-center"
          >
            Crear cuenta y continuar →
          </button>
        </div>
      </div>
    </div>
  )
}
