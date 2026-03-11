'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAgentStore } from '@/store/agent'
import { TIER_PRICES, TIER_LABELS, TIER_DESC, AgentTier } from '@/types/agent'

const ALL_TIERS: AgentTier[] = ['starter', 'professional', 'enterprise']

function DiagramNode({ label, sub, accent }: { label: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`border px-4 py-3 text-center ${accent ? 'border-cyan glow-cyan' : 'border-cream/15'}`}>
      <div className="font-mono text-xs font-bold text-cream">{label}</div>
      {sub && <div className="font-mono text-xs text-cream/35 mt-0.5">{sub}</div>}
    </div>
  )
}

function Connector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-4 bg-cyan/20" />
      <div className="font-mono text-xs text-cyan/30">↓</div>
      <div className="w-px h-1 bg-cyan/20" />
    </div>
  )
}

export default function EstructuraPage() {
  const router = useRouter()
  const { tier } = useAgentStore()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="font-mono text-xs text-cyan/50 uppercase tracking-widest mb-3">Estructura recomendada</div>
      <h1 className="font-mono text-3xl font-bold text-cream mb-12">Smart Fiduciae</h1>

      <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
        {/* Diagram */}
        <div>
          <div className="agent-label mb-6">Diagrama de relaciones</div>
          <div className="max-w-xs">
            <DiagramNode label="FIDUCIANTE" sub="Tu empresa" />
            <Connector />
            <DiagramNode label="CONTRATO DE FIDEICOMISO" sub="off-chain" />
            <Connector />
            <DiagramNode label="FIDUCIARIO: ANDÉN" sub="Titularidad legal · Supervisión · Override" accent />
            <Connector />
            <DiagramNode label="PATRIMONIO FIDUCIARIO SEPARADO" sub="Art. 1682 CCyC · Aislado del riesgo" />
            <Connector />
            <DiagramNode label="AGENTE DE IA" sub="Opera como herramienta · Smart contracts on-chain" accent />
            <Connector />
            <DiagramNode label="BENEFICIARIO" sub="Tu empresa / inversores / holders" />
          </div>
          <p className="font-sans text-xs text-cream/30 mt-6 leading-relaxed max-w-xs">
            El agente no es sujeto del fideicomiso. Es la herramienta de ejecución.
            El patrimonio está separado. Andén es responsable. Vos definís los parámetros.
          </p>
        </div>

        {/* Tier cards */}
        <div>
          <div className="agent-label mb-6">Tier recomendado</div>
          <div className="space-y-3">
            {ALL_TIERS.map((t) => {
              const recommended = t === tier
              const prices = TIER_PRICES[t]
              return (
                <div
                  key={t}
                  className={`border p-5 transition-all ${
                    recommended
                      ? 'border-cyan glow-cyan'
                      : 'border-cream/10 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-mono text-sm font-bold text-cream uppercase">{TIER_LABELS[t]}</div>
                      <div className="font-sans text-xs text-cream/40 mt-0.5">{TIER_DESC[t]}</div>
                    </div>
                    {recommended && (
                      <span className="agent-badge text-xs flex-shrink-0 ml-3">Recomendado</span>
                    )}
                  </div>
                  <div className="font-mono text-cyan mt-3">
                    Setup: USD {prices.setup.toLocaleString()}
                    <span className="text-cream/30 text-xs ml-2">
                      · Mensual: USD {prices.monthly}{prices.monthlyPct ? ` + ${prices.monthlyPct}% AUM` : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="font-sans text-xs text-cream/25 mt-3">
            El cargo mensual se activa cuando el fideicomiso esté operativo. Hoy solo se cobra el setup.
          </p>
        </div>
      </div>

      {/* Scenarios */}
      <div className="agent-label mb-6">Escenario regulatorio</div>
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <div className="border border-cream/10 p-5">
          <div className="font-mono text-xs text-cream/40 mb-1">ESCENARIO 1 — BASE</div>
          <div className="font-mono text-sm font-bold text-cream mb-3">DISPONIBLE HOY</div>
          <ul className="space-y-1.5 mb-4">
            {['CCyC tal cual, sin Zona Franca formal', 'Patrimonio separado · Smart contracts', 'Cualquier activo digital', 'Sin beneficios tributarios ZF todavía'].map((i) => (
              <li key={i} className="font-sans text-xs text-cream/50 flex gap-2"><span className="text-cyan/50">·</span>{i}</li>
            ))}
          </ul>
          <div className="font-mono text-xs text-cyan/60">Plazo: disponible en semanas</div>
        </div>
        <div className="border border-cyan/25 p-5">
          <div className="font-mono text-xs text-cyan/60 mb-1">ESCENARIO 2 — ZONA DIGITAL MENDOZA</div>
          <div className="font-mono text-sm font-bold text-cream mb-3">Q3 2026</div>
          <ul className="space-y-1.5 mb-4">
            {['Todo el Escenario 1 +', 'Registro institucional IDITS', 'Validación DPJ · Sandbox formal', 'Beneficios tributarios ZF + LEC'].map((i) => (
              <li key={i} className="font-sans text-xs text-cream/50 flex gap-2"><span className="text-cyan">·</span>{i}</li>
            ))}
          </ul>
          <div className="font-mono text-xs text-cyan/60">Precio bloqueado para Founding Members</div>
        </div>
      </div>

      {/* Founding member badge */}
      <div className="border border-cyan/20 bg-cyan/5 p-6 mb-10">
        <div className="font-mono text-xs text-cyan mb-2">⭐ FOUNDING MEMBER</div>
        <p className="font-sans text-sm text-cream/60">
          Registrarte ahora te da acceso prioritario al Escenario 2, precio bloqueado al tier actual,
          y participación en el diseño del sandbox regulatorio.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => router.back()} className="agent-btn-secondary">← Volver</button>
        <Link href="/agents/parametros" className="agent-btn text-center flex-1">
          Definir parámetros →
        </Link>
      </div>
    </div>
  )
}
