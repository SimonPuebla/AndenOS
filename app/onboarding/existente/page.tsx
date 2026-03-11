'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { QuestionCard } from '@/components/onboarding/QuestionCard'

type ExistingStep = 'forma_legal' | 'afip' | 'actividad' | 'camino'

const CAMINOS: Record<string, { label: string; desc: string; badge: string }> = {
  A: {
    label: 'Camino A — SAS existente → ZF + LEC',
    desc: 'Tu SAS está activa. Se gestiona directamente la adhesión a la Zona Franca Digital y la inscripción LEC.',
    badge: 'Más directo',
  },
  B: {
    label: 'Camino B — SA/SRL → nueva SAS OpCo en ZF + LEC',
    desc: 'Se constituye una nueva SAS como entidad operativa en DEZ, manteniendo la SA/SRL existente. La nueva SAS se inscribe en LEC.',
    badge: 'Reorganización',
  },
  C: {
    label: 'Camino C — Delaware sin AR → nueva SAS + LEC',
    desc: 'Tenés una Delaware pero no entidad en Argentina. Se constituye una SAS en DEZ como OpCo y se inscribe en LEC.',
    badge: 'Expansión local',
  },
  D: {
    label: 'Camino D — Delaware + SAS → Camino A',
    desc: 'Ya tenés la estructura Delaware + SAS. Se aplica el Camino A: inscripción directa en ZF y LEC para la SAS existente.',
    badge: 'Optimización',
  },
}

function detectCamino(formaLegal: string): string {
  if (formaLegal === 'sas') return 'A'
  if (formaLegal === 'sa_srl') return 'B'
  if (formaLegal === 'delaware_sin_ar') return 'C'
  if (formaLegal === 'delaware_con_sas') return 'D'
  return 'B' // default for otras
}

export default function ExistentePage() {
  const router = useRouter()
  const store = useOnboardingStore()

  const [currentStep, setCurrentStep] = useState<ExistingStep>('forma_legal')
  const [formaLegal, setFormaLegal] = useState('')
  const [afipAlDia, setAfipAlDia] = useState('')
  const [actividad, setActividad] = useState('')
  const [caminoDetectado, setCaminoDetectado] = useState('')

  const progress = {
    forma_legal: 1,
    afip: 2,
    actividad: 3,
    camino: 4,
  }[currentStep]

  const handleFormaLegal = (value: string) => {
    setFormaLegal(value)
    store.setFormaLegal(value)
    setTimeout(() => setCurrentStep('afip'), 200)
  }

  const handleAfip = (value: string) => {
    setAfipAlDia(value)
    store.setAfipAlDia(value)
    setTimeout(() => setCurrentStep('actividad'), 200)
  }

  const handleActividad = (value: string) => {
    setActividad(value)
    store.setActividad(value as Parameters<typeof store.setActividad>[0])
    const camino = detectCamino(formaLegal)
    setCaminoDetectado(camino)
    setTimeout(() => setCurrentStep('camino'), 200)
  }

  const handleContinue = () => {
    // Set mode to existing and continue to main onboarding from step 5
    store.setMode('existing')
    router.push('/onboarding?mode=existing&step=5')
  }

  const camino = CAMINOS[caminoDetectado]

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b-2 border-dark bg-cream sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-xl tracking-tight">
            ANDÉN<span className="text-orange">.</span>
          </Link>
          <div className="w-64 hidden md:block">
            <ProgressBar current={progress} total={4} label="Diagnóstico empresa existente" />
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="tag bg-blue text-cream border-blue mb-4 inline-block">
            Empresa existente
          </div>
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-dark mb-2">
            Registrá tu empresa en la LEC
          </h1>
          <p className="font-sans text-dark/60">
            Ya tenés una empresa. Te ayudamos a inscribirla en la Ley de Economía del Conocimiento.
          </p>
        </div>

        {currentStep === 'forma_legal' && (
          <QuestionCard
            stepNumber={1}
            block="Empresa existente — Diagnóstico"
            question="¿Qué forma legal tiene tu empresa hoy?"
            options={[
              { value: 'sas', label: 'SAS (Sociedad por Acciones Simplificada)', badge: 'Camino A' },
              { value: 'sa_srl', label: 'SA o SRL (Sociedad Anónima o de Responsabilidad Limitada)', badge: 'Camino B' },
              { value: 'delaware_sin_ar', label: 'Delaware sin entidad en Argentina', badge: 'Camino C' },
              { value: 'delaware_con_sas', label: 'Delaware con SAS en Argentina', badge: 'Camino D' },
              { value: 'otra', label: 'Otra forma legal' },
            ]}
            selected={formaLegal}
            onSelect={handleFormaLegal}
            onBack={() => router.push('/')}
          />
        )}

        {currentStep === 'afip' && (
          <QuestionCard
            stepNumber={2}
            block="Empresa existente — Diagnóstico"
            question="¿Tu empresa está al día con AFIP / ARCA?"
            subtitle="Esto es necesario para la inscripción LEC."
            options={[
              { value: 'si', label: 'Sí, estamos al día' },
              { value: 'no', label: 'No, tenemos deudas pendientes' },
              { value: 'no_se', label: 'No sé / No verificamos' },
            ]}
            selected={afipAlDia}
            onSelect={handleAfip}
            onBack={() => setCurrentStep('forma_legal')}
            warning={
              afipAlDia === 'no' ? (
                <div className="flex items-start gap-2 p-3 border border-orange bg-orange/10">
                  <AlertTriangle className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-dark/70">
                    Las deudas con AFIP pueden impedir la inscripción en LEC. Andén puede orientarte sobre cómo regularizar la situación.
                  </p>
                </div>
              ) : null
            }
          />
        )}

        {currentStep === 'actividad' && (
          <QuestionCard
            stepNumber={3}
            block="Empresa existente — Elegibilidad LEC"
            question="¿Cuál es la actividad principal de tu empresa?"
            options={[
              { value: 'software_saas_ia', label: 'Software / SaaS / IA', badge: 'LEC' },
              { value: 'crypto_web3_defi', label: 'Crypto / Web3 / DeFi', badge: 'LEC' },
              { value: 'produccion_audiovisual', label: 'Producción audiovisual', badge: 'LEC' },
              { value: 'biotecnologia', label: 'Biotecnología / Ciencias de la vida', badge: 'LEC' },
              { value: 'servicios_profesionales', label: 'Servicios profesionales de exportación', badge: 'LEC' },
              { value: 'industria_4', label: 'Industria 4.0 / Automatización / IoT', badge: 'LEC' },
              { value: 'nanotecnologia', label: 'Nanotecnología / Aeroespacial / Nuclear', badge: 'LEC' },
              { value: 'otra', label: 'Otra actividad' },
            ]}
            selected={actividad}
            onSelect={handleActividad}
            onBack={() => setCurrentStep('afip')}
          />
        )}

        {currentStep === 'camino' && camino && (
          <div className="max-w-xl">
            <div className="font-mono text-xs text-orange uppercase tracking-wider mb-4">
              Diagnóstico completado
            </div>
            <h2 className="font-mono text-2xl font-bold mb-4">Tu camino recomendado</h2>

            <div className="card border-2 border-orange shadow-[4px_4px_0px_#F89A2F] mb-6">
              <div className="tag bg-orange text-dark border-orange mb-3 inline-block">
                {camino.badge}
              </div>
              <h3 className="font-mono text-lg font-bold mb-2">{camino.label}</h3>
              <p className="font-sans text-dark/70 leading-relaxed">{camino.desc}</p>
            </div>

            {/* Migration warning */}
            {(caminoDetectado === 'B' || caminoDetectado === 'C') && (
              <div className="border-2 border-orange bg-orange/10 p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-xs font-bold mb-1">AVISO DE MIGRACIÓN</div>
                    <p className="font-sans text-sm text-dark/70 leading-relaxed">
                      Los contratos, clientes y empleados existentes están a nombre de tu empresa actual.
                      La migración implica transferir operaciones a la nueva entidad. Andén gestiona la
                      constitución y LEC; la transferencia de contratos requiere revisión legal caso a caso.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {afipAlDia === 'no' && (
              <div className="border-2 border-dark/30 bg-dark/5 p-4 mb-6">
                <div className="font-mono text-xs font-bold mb-1">REGULARIZACIÓN AFIP</div>
                <p className="font-sans text-sm text-dark/70">
                  Para inscribirte en LEC necesitarás regularizar la situación impositiva. Nuestro equipo puede orientarte en este proceso.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setCurrentStep('actividad')} className="btn-secondary">
                ← Volver
              </button>
              <button onClick={handleContinue} className="flex-1 btn-primary text-center">
                Continuar diagnóstico <ArrowRight className="inline ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
