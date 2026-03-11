'use client'

import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agent'
import { AgentAsset, BeneficiaryType } from '@/types/agent'
import { AlertTriangle } from 'lucide-react'

const ASSET_OPTIONS: { value: AgentAsset; label: string }[] = [
  { value: 'crypto', label: 'Criptomonedas (BTC / ETH / otras)' },
  { value: 'stablecoins', label: 'Stablecoins (USDC / USDT / DAI)' },
  { value: 'defi_tokens', label: 'Tokens de protocolos DeFi' },
  { value: 'rwa', label: 'Activos tokenizados (RWA)' },
  { value: 'fiat', label: 'Fiat / USD vía rails bancarios' },
  { value: 'datos_apis', label: 'Datos o APIs con valor económico' },
]

const OVERRIDE_CONDITIONS = [
  'Si supera el límite transaccional definido',
  'Si el portafolio cae más de X% en 24hs',
  'Si detecta actividad fuera de los activos permitidos',
  'Ante cualquier solicitud regulatoria',
  'Intervención manual a pedido del fiduciante en cualquier momento',
  'Ante cualquier transacción mayor a USD ___',
]

export default function ParametrosPage() {
  const router = useRouter()
  const store = useAgentStore()
  const {
    limit_per_tx, limit_daily, limit_monthly,
    allowed_assets, prohibited_assets,
    override_conditions, override_drop_pct, override_tx_threshold,
    beneficiary_type, beneficiary_details,
  } = store

  // Validation
  const dailyOk = !limit_per_tx || !limit_daily || limit_daily >= limit_per_tx
  const monthlyOk = !limit_daily || !limit_monthly || limit_monthly >= limit_daily
  const canContinue = limit_per_tx && limit_daily && limit_monthly && allowed_assets.length > 0 && dailyOk && monthlyOk

  const holderTokens = beneficiary_type === 'holders_tokens'

  // Volume hint based on P3
  const volHints: Record<string, string> = {
    menos_10k: '10,000', '10k_100k': '100,000', '100k_1m': '1,000,000', mas_1m: '5,000,000',
  }
  const placeholder = store.agent_volume ? volHints[store.agent_volume] : ''

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="agent-label mb-3">Parámetros del fideicomiso</div>
      <h1 className="font-mono text-3xl font-bold text-cream mb-4">Definí los límites del agente</h1>
      <p className="font-sans text-sm text-cream/40 mb-12">
        Estos quedan escritos en el contrato de fideicomiso y no pueden ser superados sin intervención del fiduciario.
      </p>

      {/* Section A — Limits */}
      <section className="mb-10">
        <div className="agent-label mb-4">A — Límites transaccionales</div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="font-mono text-xs text-cream/40 mb-1 block">Límite por transacción</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-cream/30">USD</span>
              <input
                type="number" min={0}
                value={limit_per_tx || ''}
                onChange={(e) => store.setLimitPerTx(Number(e.target.value))}
                placeholder={placeholder}
                className="agent-input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="font-mono text-xs text-cream/40 mb-1 block">Límite diario</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-cream/30">USD</span>
              <input
                type="number" min={0}
                value={limit_daily || ''}
                onChange={(e) => store.setLimitDaily(Number(e.target.value))}
                className="agent-input pl-10"
              />
            </div>
            {!dailyOk && (
              <div className="flex items-center gap-1 mt-1 text-orange">
                <AlertTriangle className="w-3 h-3" />
                <span className="font-mono text-xs">Debe ser ≥ al límite por transacción</span>
              </div>
            )}
          </div>
          <div>
            <label className="font-mono text-xs text-cream/40 mb-1 block">Límite mensual</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-cream/30">USD</span>
              <input
                type="number" min={0}
                value={limit_monthly || ''}
                onChange={(e) => store.setLimitMonthly(Number(e.target.value))}
                className="agent-input pl-10"
              />
            </div>
            {!monthlyOk && (
              <div className="flex items-center gap-1 mt-1 text-orange">
                <AlertTriangle className="w-3 h-3" />
                <span className="font-mono text-xs">Debe ser ≥ al límite diario</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section B — Assets */}
      <section className="mb-10">
        <div className="agent-label mb-4">B — Activos permitidos</div>
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {ASSET_OPTIONS.map((opt) => {
            const selected = allowed_assets.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => {
                  const next = selected
                    ? allowed_assets.filter((a) => a !== opt.value)
                    : [...allowed_assets, opt.value]
                  store.setAllowedAssets(next)
                }}
                className={`text-left p-3 border text-sm transition-all flex items-center gap-3 ${
                  selected ? 'border-cyan/50 bg-cyan/5' : 'border-cream/10 hover:border-cream/20'
                }`}
              >
                <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${selected ? 'border-cyan bg-cyan/20' : 'border-cream/20'}`}>
                  {selected && <span className="text-cyan text-xs">✓</span>}
                </div>
                <span className="font-sans text-cream/70">{opt.label}</span>
              </button>
            )
          })}
        </div>
        <div>
          <label className="font-mono text-xs text-cream/40 mb-1 block">Activos explícitamente prohibidos (opcional)</label>
          <input
            type="text"
            value={prohibited_assets}
            onChange={(e) => store.setProhibitedAssets(e.target.value)}
            placeholder="Ej: tokens no auditados, activos con <$1M liquidez"
            className="agent-input"
          />
        </div>
      </section>

      {/* Section C — Override */}
      <section className="mb-10">
        <div className="agent-label mb-4">C — Condiciones de override</div>
        <div className="space-y-2 mb-4">
          {OVERRIDE_CONDITIONS.map((cond, i) => {
            const selected = override_conditions.includes(cond)
            const isDropPct = i === 1
            const isTxThreshold = i === 5
            return (
              <div key={cond}>
                <button
                  onClick={() => store.toggleOverrideCondition(cond)}
                  className={`w-full text-left p-3 border flex items-center gap-3 transition-all ${
                    selected ? 'border-cyan/40 bg-cyan/5' : 'border-cream/10 hover:border-cream/20'
                  }`}
                >
                  <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${selected ? 'border-cyan bg-cyan/20' : 'border-cream/20'}`}>
                    {selected && <span className="text-cyan text-xs">✓</span>}
                  </div>
                  <span className="font-sans text-sm text-cream/70">{cond}</span>
                </button>
                {selected && isDropPct && (
                  <div className="ml-7 mt-2 flex items-center gap-2">
                    <input
                      type="number" min={1} max={100}
                      value={override_drop_pct || ''}
                      onChange={(e) => store.setOverrideDropPct(Number(e.target.value))}
                      placeholder="X"
                      className="agent-input w-20 text-center"
                    />
                    <span className="font-mono text-xs text-cream/30">% de caída en 24hs</span>
                  </div>
                )}
                {selected && isTxThreshold && (
                  <div className="ml-7 mt-2 flex items-center gap-2">
                    <span className="font-mono text-xs text-cream/30">USD</span>
                    <input
                      type="number" min={0}
                      value={override_tx_threshold || ''}
                      onChange={(e) => store.setOverrideTxThreshold(Number(e.target.value))}
                      placeholder="monto"
                      className="agent-input w-32"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Section D — Beneficiary */}
      <section className="mb-12">
        <div className="agent-label mb-4">D — Beneficiario del fideicomiso</div>
        <div className="space-y-2 mb-4">
          {([
            ['empresa', 'Mi empresa (la misma que actúa como fiduciante)'],
            ['empresa_inversores', 'Mi empresa + inversores'],
            ['holders_tokens', 'Holders de tokens — certificados de participación (Art. 1694 CCyC)'],
            ['a_definir', 'A definir con el equipo Andén'],
          ] as [BeneficiaryType, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => store.setBeneficiaryType(val)}
              className={`w-full text-left p-3 border flex items-center gap-3 transition-all ${
                beneficiary_type === val ? 'border-cyan/40 bg-cyan/5' : 'border-cream/10 hover:border-cream/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border flex-shrink-0 ${beneficiary_type === val ? 'border-cyan bg-cyan' : 'border-cream/20'}`} />
              <span className="font-sans text-sm text-cream/70">{label}</span>
            </button>
          ))}
        </div>

        {beneficiary_type === 'empresa_inversores' && (
          <div>
            <label className="font-mono text-xs text-cream/40 mb-1 block">Detalle de distribución</label>
            <input
              type="text"
              value={beneficiary_details}
              onChange={(e) => store.setBeneficiaryDetails(e.target.value)}
              placeholder="Ej: Mi empresa 70% · Inversores 30%"
              className="agent-input"
            />
          </div>
        )}

        {holderTokens && (
          <div className="mt-3 p-4 border border-orange/30 bg-orange/5">
            <p className="font-sans text-xs text-cream/60">
              Esta opción habilita un fideicomiso financiero con emisión de certificados de participación tokenizados (Art. 1694 CCyC).
              Requiere tier Enterprise o llamada con el equipo.
            </p>
          </div>
        )}
      </section>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => router.back()} className="agent-btn-secondary">← Volver</button>
        <button
          onClick={() => router.push('/agents/registro')}
          disabled={!canContinue}
          className="agent-btn flex-1 text-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Revisar expediente →
        </button>
      </div>
    </div>
  )
}
