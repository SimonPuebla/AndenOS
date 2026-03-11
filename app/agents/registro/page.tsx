'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agent'
import { TIER_PRICES, TIER_LABELS } from '@/types/agent'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

function generateAgentId() {
  return `SF-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
}

export default function AgentRegistroPage() {
  const router = useRouter()
  const store = useAgentStore()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'summary' | 'register'>('summary')

  const { tier, limit_per_tx, limit_daily, limit_monthly, agent_function, agent_assets,
    agent_autonomy, agent_supervision, override_conditions, beneficiary_type } = store
  const prices = TIER_PRICES[tier]

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden')
    if (password.length < 8) return setError('Contraseña de al menos 8 caracteres')
    if (!nombre.trim()) return setError('Ingresá tu nombre')

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: nombre } },
      })
      if (authError) throw authError

      if (data.user) {
        await supabase.from('agent_expedients').insert({
          user_id: data.user.id,
          status: 'draft',
          agent_function,
          agent_assets,
          agent_volume: store.agent_volume,
          agent_autonomy,
          agent_supervision,
          has_company: store.has_company !== undefined,
          company_type: store.has_company,
          agent_scope: store.agent_scope,
          tier,
          scenario: 2,
          limit_per_tx,
          limit_daily,
          limit_monthly,
          allowed_assets: store.allowed_assets,
          prohibited_assets: store.prohibited_assets,
          override_conditions,
          override_drop_pct: store.override_drop_pct,
          override_tx_threshold: store.override_tx_threshold,
          beneficiary_type,
          beneficiary_details: store.beneficiary_details,
          is_founding_member: true,
        })
      }
      router.push('/agents/registro/pago')
    } catch (err) {
      const e = err as { message?: string }
      setError(e.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const agentId = generateAgentId()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {step === 'summary' && (
        <>
          <div className="agent-label mb-3">Expediente Smart Fiduciae</div>
          <h1 className="font-mono text-3xl font-bold text-cream mb-8">Revisá tu estructura</h1>

          {/* Contract preview with watermark */}
          <div className="relative border border-cyan/20 p-6 mb-8 overflow-hidden font-mono text-xs text-cream/50 leading-relaxed">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-30deg]">
              <span className="text-cream/5 text-3xl font-bold whitespace-nowrap">ANDÉN CONFIDENCIAL — SMART FIDUCIAE</span>
            </div>
            <div className="space-y-2 relative z-10">
              <div className="text-cyan/60 mb-4">SMART FIDUCIAE — CONTRATO DE FIDEICOMISO<br />Con Administración Algorítmica</div>
              <div>Fiduciante: <span className="text-cream">[NOMBRE EMPRESA]</span></div>
              <div>Fiduciario: <span className="text-cream">Andén (Zona Digital Mendoza)</span></div>
              <div>Beneficiario: <span className="text-cream">{beneficiary_type ?? '[PENDIENTE]'}</span></div>
              <div className="pt-2">Patrimonio Fiduciario:</div>
              <div className="pl-4">· Activos: <span className="text-cream">{agent_assets.length > 0 ? agent_assets.join(', ') : '[PENDIENTE]'}</span></div>
              <div className="pl-4">· Límite por transacción: <span className="text-cream">USD {limit_per_tx?.toLocaleString() ?? '[PENDIENTE]'}</span></div>
              <div className="pl-4">· Límite diario: <span className="text-cream">USD {limit_daily?.toLocaleString() ?? '[PENDIENTE]'}</span></div>
              <div className="pl-4">· Límite mensual: <span className="text-cream">USD {limit_monthly?.toLocaleString() ?? '[PENDIENTE]'}</span></div>
              <div className="pt-2">Agente de IA:</div>
              <div className="pl-4">· Función: <span className="text-cream">{agent_function ?? '[PENDIENTE]'}</span></div>
              <div className="pl-4">· Autonomía: <span className="text-cream">{agent_autonomy ?? '[PENDIENTE]'}</span></div>
              <div className="pl-4">· Supervisión: <span className="text-cream">{agent_supervision ?? '[PENDIENTE]'}</span></div>
              <div className="pl-4">· Override: <span className="text-cream">{override_conditions.length > 0 ? `${override_conditions.length} condiciones` : '[PENDIENTE]'}</span></div>
              <div className="pt-2">Tier: <span className="text-cyan">{TIER_LABELS[tier]}</span></div>
              <div>Escenario: <span className="text-cream">2 — Zona Digital Mendoza</span></div>
              <div>Founding Member: <span className="text-cyan">Sí ⭐</span></div>
              <div className="pt-3 border-t border-cream/10 text-cream/25">[BLOQUEADO — Registrate para generar el contrato completo]</div>
            </div>
          </div>

          {/* Price */}
          <div className="border border-cyan/20 p-5 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-mono text-xs text-cream/40 mb-1">{TIER_LABELS[tier].toUpperCase()} — SETUP</div>
                <div className="font-mono text-3xl font-bold text-cyan">USD {prices.setup.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-cream/30">Founding Member</div>
                <div className="font-mono text-sm text-cyan mt-1">⭐ Precio bloqueado</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => router.back()} className="agent-btn-secondary">← Volver</button>
            <button onClick={() => setStep('register')} className="agent-btn flex-1 text-center">
              Crear cuenta →
            </button>
          </div>
        </>
      )}

      {step === 'register' && (
        <>
          <div className="agent-label mb-3">Registro</div>
          <h1 className="font-mono text-3xl font-bold text-cream mb-8">Creá tu cuenta</h1>

          <div className="border border-cyan/20 p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="font-mono text-xs text-cream/40 mb-1 block">Nombre completo</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  placeholder="María González" required className="agent-input" />
              </div>
              <div>
                <label className="font-mono text-xs text-cream/40 mb-1 block">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@startup.com" required className="agent-input" />
              </div>
              <div>
                <label className="font-mono text-xs text-cream/40 mb-1 block">Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres" required minLength={8} className="agent-input pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/60">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-mono text-xs text-cream/40 mb-1 block">Confirmar contraseña</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir contraseña" required className="agent-input" />
              </div>
              {error && (
                <div className="border border-orange/40 bg-orange/5 p-3">
                  <p className="font-sans text-sm text-orange/80">{error}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep('summary')} className="agent-btn-secondary">← Volver</button>
                <button type="submit" disabled={loading}
                  className="flex-1 agent-btn text-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Creando cuenta...' : 'Crear cuenta y continuar →'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
