'use client'

import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agent'
import { AgentFunction, AgentAsset, AgentVolume, AgentAutonomy, AgentSupervision, CompanyStatus, AgentScope } from '@/types/agent'
import { ArrowLeft } from 'lucide-react'

type StepOption = { value: string; label: string; badge?: string; desc?: string; note?: string }

const STEPS: {
  id: string
  question: string
  subtitle?: string
  multi?: boolean
  options: StepOption[]
  inlineNote?: (val: string | string[]) => string | null
}[] = [
  {
    id: 'agent_function',
    question: '¿Qué hace tu agente?',
    options: [
      { value: 'trading', label: 'Trading algorítmico o gestión de activos digitales', badge: 'ALTO' },
      { value: 'defi', label: 'Yield farming / optimización DeFi', badge: 'ALTO' },
      { value: 'pagos', label: 'Procesamiento autónomo de pagos o transacciones' },
      { value: 'tesoreria', label: 'Gestión de tesorería (DAO, fondo, empresa)', badge: 'ALTO' },
      { value: 'marketplace', label: 'Marketplace autónomo o agente de compras' },
      { value: 'claims', label: 'Procesamiento de claims o decisiones de negocio' },
      { value: 'general_fondos', label: 'Agente de IA general con acceso a fondos' },
      { value: 'otro', label: 'Otro' },
    ],
  },
  {
    id: 'agent_assets',
    question: '¿Con qué activos opera?',
    subtitle: 'Seleccioná todos los que aplican.',
    multi: true,
    options: [
      { value: 'crypto', label: 'Criptomonedas (BTC / ETH / otras)' },
      { value: 'stablecoins', label: 'Stablecoins (USDC / USDT / DAI)' },
      { value: 'defi_tokens', label: 'Tokens de protocolos DeFi' },
      { value: 'rwa', label: 'Activos tokenizados (RWA)', note: 'Requiere coordinación CNV' },
      { value: 'fiat', label: 'Fiat / USD vía rails bancarios', note: 'Requiere coordinación BCRA' },
      { value: 'datos_apis', label: 'Datos o APIs con valor económico' },
      { value: 'no_activos', label: 'No maneja activos directamente' },
    ],
  },
  {
    id: 'agent_volume',
    question: '¿Cuánto volumen transaccional estimás?',
    options: [
      { value: 'menos_10k', label: 'Menos de USD 10k', badge: 'Starter' },
      { value: '10k_100k', label: 'USD 10k – 100k', badge: 'Starter / Pro' },
      { value: '100k_1m', label: 'USD 100k – 1M', badge: 'Professional' },
      { value: 'mas_1m', label: 'Más de USD 1M', badge: 'Enterprise' },
      { value: 'no_se', label: 'No lo sé todavía' },
    ],
  },
  {
    id: 'agent_autonomy',
    question: '¿Cómo toma decisiones el agente?',
    inlineNote: (v) =>
      (v === 'ia_adaptable' || v === 'autonomo_total')
        ? 'Andén como fiduciario conserva siempre capacidad de override. Cuanto más autónomo, más importantes son los límites transaccionales.'
        : null,
    options: [
      { value: 'rule_based', label: 'Ejecuta reglas predefinidas sin variación (rule-based)' },
      { value: 'ia_fijo', label: 'Usa IA dentro de parámetros fijos' },
      { value: 'ia_adaptable', label: 'Usa IA con capacidad de adaptarse' },
      { value: 'autonomo_total', label: 'Completamente autónomo — aprende y evoluciona' },
    ],
  },
  {
    id: 'agent_supervision',
    question: '¿Qué nivel de supervisión humana tiene?',
    inlineNote: (v) =>
      v === 'autonomo'
        ? 'Andén como fiduciario conserva siempre capacidad de override. Cuanto más autónomo es el agente, más importantes son los límites transaccionales definidos en el contrato.'
        : null,
    options: [
      { value: 'revision_previa', label: 'Revisión humana antes de cada acción' },
      { value: 'revision_periodica', label: 'Revisión periódica por lotes o umbral' },
      { value: 'excepcion', label: 'Supervisión de excepciones solamente' },
      { value: 'autonomo', label: 'Completamente autónomo sin revisión habitual' },
    ],
  },
  {
    id: 'has_company',
    question: '¿Tenés empresa constituida?',
    inlineNote: (v) =>
      v === 'no_empresa'
        ? 'Para constituir el fideicomiso necesitarás una empresa. Podemos ayudarte a armarla en paralelo.'
        : null,
    options: [
      { value: 'sas_sa', label: 'Sí — SAS o SA en Argentina' },
      { value: 'delaware', label: 'Sí — Delaware (con o sin entidad en Argentina)' },
      { value: 'no_empresa', label: 'No tengo empresa todavía' },
    ],
  },
  {
    id: 'agent_scope',
    question: '¿Desde dónde opera y a quiénes sirve?',
    options: [
      { value: 'argentina_local', label: 'Opera desde Argentina, usuarios en Argentina' },
      { value: 'argentina_global', label: 'Opera desde Argentina, usuarios globales' },
      { value: 'onchain', label: 'Opera en protocolos on-chain sin geografía fija' },
      { value: 'mixto', label: 'Mixto' },
    ],
  },
]

const ASSET_LABELS: Record<string, string> = {
  crypto: 'Crypto', stablecoins: 'Stablecoins', defi_tokens: 'Tokens DeFi',
  rwa: 'RWA', fiat: 'Fiat/USD', datos_apis: 'Datos/APIs', no_activos: 'Sin activos',
}
const FUNCTION_LABELS: Record<string, string> = {
  trading: 'Trading', defi: 'DeFi/Yield', pagos: 'Pagos', tesoreria: 'Tesorería',
  marketplace: 'Marketplace', claims: 'Claims', general_fondos: 'General IA', otro: 'Otro',
}

export default function AgentOnboardingPage() {
  const router = useRouter()
  const store = useAgentStore()
  const { currentStep, nextStep, prevStep } = store
  const step = STEPS[currentStep]
  const totalSteps = STEPS.length

  const getValue = (): string | string[] => {
    if (step.id === 'agent_assets') return store.agent_assets
    return (store as unknown as Record<string, unknown>)[step.id] as string ?? ''
  }

  const handleSelect = (value: string) => {
    if (step.multi) {
      store.toggleAsset(value as AgentAsset)
      return
    }
    const setters: Record<string, (v: string) => void> = {
      agent_function: (v) => store.setAgentFunction(v as AgentFunction),
      agent_volume: (v) => store.setAgentVolume(v as AgentVolume),
      agent_autonomy: (v) => store.setAgentAutonomy(v as AgentAutonomy),
      agent_supervision: (v) => store.setAgentSupervision(v as AgentSupervision),
      has_company: (v) => store.setHasCompany(v as CompanyStatus),
      agent_scope: (v) => store.setAgentScope(v as AgentScope),
    }
    setters[step.id]?.(value)
    setTimeout(() => {
      if (currentStep < totalSteps - 1) nextStep()
      else router.push('/agents/estructura')
    }, 200)
  }

  const handleMultiContinue = () => {
    if (currentStep < totalSteps - 1) nextStep()
    else router.push('/agents/estructura')
  }

  const handleBack = () => {
    if (currentStep === 0) router.push('/agents')
    else prevStep()
  }

  const currentVal = getValue()
  const note = step.inlineNote?.(currentVal) ?? null
  const progressPct = ((currentStep + 1) / totalSteps) * 100

  // Profile accumulation sidebar items
  const profile: { label: string; value: string }[] = []
  if (store.agent_function) profile.push({ label: 'Función', value: FUNCTION_LABELS[store.agent_function] ?? store.agent_function })
  if (store.agent_assets.length > 0) profile.push({ label: 'Activos', value: store.agent_assets.map((a) => ASSET_LABELS[a] ?? a).join(', ') })
  if (store.agent_volume) profile.push({ label: 'Volumen', value: store.agent_volume })
  if (store.agent_autonomy) profile.push({ label: 'Autonomía', value: store.agent_autonomy })
  if (store.agent_supervision) profile.push({ label: 'Supervisión', value: store.agent_supervision })
  if (store.has_company) profile.push({ label: 'Empresa', value: store.has_company })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="agent-label">Diagnóstico del agente</span>
          <span className="font-mono text-xs text-cream/30">{currentStep + 1} / {totalSteps}</span>
        </div>
        <div className="h-px bg-cream/10 w-full relative">
          <div
            className="absolute top-0 left-0 h-px bg-cyan transition-all duration-300"
            style={{ width: `${progressPct}%`, boxShadow: '0 0 6px #00E5FF' }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_260px] gap-10">
        {/* Question */}
        <div>
          <button onClick={handleBack} className="flex items-center gap-2 font-mono text-xs text-cream/30 hover:text-cream/60 mb-8 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Volver
          </button>

          <div className="font-mono text-xs text-cyan/60 uppercase tracking-[0.15em] mb-3">
            Pregunta {currentStep + 1}
          </div>
          <h2 className="font-mono text-2xl md:text-3xl font-bold text-cream mb-2">{step.question}</h2>
          {step.subtitle && <p className="font-sans text-sm text-cream/40 mb-6">{step.subtitle}</p>}
          {!step.subtitle && <div className="mb-6" />}

          <div className="space-y-2">
            {step.options.map((opt) => {
              const isSelected = step.multi
                ? (currentVal as string[]).includes(opt.value)
                : currentVal === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left p-4 border transition-all duration-100 flex items-center justify-between group ${
                    isSelected
                      ? 'border-cyan bg-cyan/5 glow-cyan'
                      : 'border-cream/10 hover:border-cyan/40 bg-transparent'
                  }`}
                >
                  <div>
                    <span className="font-sans text-sm text-cream">{opt.label}</span>
                    {opt.note && (
                      <span className="block font-mono text-xs text-orange/70 mt-0.5">{opt.note}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {opt.badge && (
                      <span className="font-mono text-xs border border-cyan/20 text-cyan/60 px-1.5 py-0.5">
                        {opt.badge}
                      </span>
                    )}
                    {step.multi && (
                      <div className={`w-4 h-4 border flex items-center justify-center ${isSelected ? 'border-cyan bg-cyan/20' : 'border-cream/20'}`}>
                        {isSelected && <span className="text-cyan text-xs">✓</span>}
                      </div>
                    )}
                    {!step.multi && (
                      <div className={`w-4 h-4 rounded-full border ${isSelected ? 'border-cyan bg-cyan' : 'border-cream/20'}`} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Inline note */}
          {note && (
            <div className="mt-4 p-4 border border-orange/30 bg-orange/5">
              <p className="font-sans text-xs text-cream/60">{note}</p>
              {step.id === 'has_company' && (
                <a href="/" target="_blank" rel="noreferrer" className="font-mono text-xs text-orange hover:underline mt-1 inline-block">
                  Constituí tu empresa acá →
                </a>
              )}
            </div>
          )}

          {/* Multi-select continue */}
          {step.multi && (
            <button
              onClick={handleMultiContinue}
              disabled={(currentVal as string[]).length === 0}
              className="mt-6 agent-btn disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar →
            </button>
          )}
        </div>

        {/* Sidebar — accumulated profile */}
        <div className="hidden md:block">
          <div className="agent-card sticky top-24">
            <div className="agent-label mb-4">Perfil del agente</div>
            {profile.length === 0 && (
              <p className="font-sans text-xs text-cream/25">Tus respuestas aparecerán acá.</p>
            )}
            <div className="space-y-3">
              {profile.map((item) => (
                <div key={item.label}>
                  <div className="font-mono text-xs text-cyan/40 uppercase">{item.label}</div>
                  <div className="font-sans text-xs text-cream/70 mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
            {profile.length > 0 && (
              <div className="mt-6 pt-4 border-t border-cream/5">
                <div className="font-mono text-xs text-cyan/40 uppercase mb-1">Tier estimado</div>
                <div className="font-mono text-sm text-cyan font-bold uppercase">{store.tier}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
