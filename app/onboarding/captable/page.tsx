'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Users } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { CapTableMember } from '@/types/onboarding'
import { ProgressBar } from '@/components/onboarding/ProgressBar'

const ROL_OPTIONS = ['Founder', 'Co-founder', 'CTO', 'Advisor', 'Inversor', 'Empleado clave'] as const
const CONTRIBUCION_OPTIONS = ['Sweat equity', 'Capital en efectivo', 'IP', 'Mixto'] as const
const VESTING_LABELS: Record<string, string> = {
  '4y_1c': '4 años, cliff 1 año',
  '3y_6m': '3 años, cliff 6 meses',
  sin_vesting: 'Sin vesting',
  a_definir: 'A definir con asesor',
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

function emptyFounder(): CapTableMember {
  return {
    id: generateId(),
    nombre: '',
    rol: 'Founder',
    equity: 0,
    contribucion: 'Sweat equity',
    vesting: '4y_1c',
  }
}

export default function CapTablePage() {
  const router = useRouter()
  const { capTable, setCapTable, casoRecomendado, lecStatus, cantidadFounders } = useOnboardingStore()

  const founder = capTable[0]
  const hasCoFounders = cantidadFounders === 'dos' || cantidadFounders === 'tres_plus'

  useEffect(() => {
    if (!founder) {
      setCapTable([emptyFounder()])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateFounder = (field: keyof CapTableMember, value: string | number) => {
    const base = founder ?? emptyFounder()
    setCapTable([{ ...base, [field]: value }])
  }

  const myEquity = Number(founder?.equity) || 0
  const remaining = 100 - myEquity
  const equityOver = myEquity > 100

  const canContinue = !!founder?.nombre?.trim() && myEquity > 0 && !equityOver

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b-2 border-dark bg-cream sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-xl tracking-tight">
            ANDÉN<span className="text-orange">.</span>
          </Link>
          <div className="w-64 hidden md:block">
            <ProgressBar current={2} total={5} label="Cap table" />
          </div>
          <div className="font-mono text-xs text-dark/40 hidden md:block">Paso 2 de 5</div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="font-mono text-xs text-orange uppercase tracking-wider mb-2">Paso 2 — Cap table</div>
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-dark mb-3">
            Tu participación en la empresa
          </h1>
          <p className="font-sans text-dark/60">
            Solo necesitamos tu rol y tu porcentaje.{' '}
            {hasCoFounders && 'Los datos de tus co-founders los completás desde el dashboard, después del registro.'}
          </p>
        </div>

        {/* Co-founders deferred notice */}
        {hasCoFounders && (
          <div className="flex items-start gap-3 p-4 border border-dark/20 bg-dark/5 mb-6">
            <Users className="w-4 h-4 text-dark/40 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-mono text-xs font-bold text-dark mb-1">
                {cantidadFounders === 'dos' ? '1 co-founder' : 'Más co-founders'} — se completa después
              </div>
              <p className="font-sans text-xs text-dark/60">
                Una vez creado el expediente, vas a poder agregar a tus co-founders desde el dashboard. No bloqueés el proceso por eso.
              </p>
            </div>
          </div>
        )}

        {/* Equity bar */}
        <div className="card mb-6">
          <div className="label-mono mb-3">Distribución de equity</div>
          <div className="h-4 bg-dark/10 border border-dark/20 w-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${equityOver ? 'bg-red-500' : 'bg-orange'}`}
              style={{ width: `${Math.min(myEquity, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 border border-dark/20 ${equityOver ? 'bg-red-500' : 'bg-orange'}`} />
              <span className="font-mono text-xs text-dark/60">Vos — {myEquity}%</span>
            </div>
            {hasCoFounders && !equityOver && remaining > 0 && (
              <span className="font-mono text-xs text-dark/40">Por distribuir — {remaining}%</span>
            )}
          </div>
          {equityOver && (
            <div className="flex items-center gap-2 mt-3 text-red-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono text-xs font-bold">El equity no puede superar 100%</span>
            </div>
          )}
        </div>

        {/* Founder form */}
        {founder && (
          <div className="card mb-8">
            <div className="label-mono text-dark/50 mb-4">Tu perfil en el cap table</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label-mono text-xs text-dark/50 mb-1 block">Tu nombre completo</label>
                <input
                  type="text"
                  value={founder.nombre}
                  onChange={(e) => updateFounder('nombre', e.target.value)}
                  placeholder="Ej: María González"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-mono text-xs text-dark/50 mb-1 block">Rol</label>
                <select
                  value={founder.rol}
                  onChange={(e) => updateFounder('rol', e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  {ROL_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="label-mono text-xs text-dark/50 mb-1 block">Tu % de equity</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={founder.equity || ''}
                    onChange={(e) => updateFounder('equity', Number(e.target.value))}
                    placeholder="0"
                    className="input-field pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-dark/40">%</span>
                </div>
              </div>

              <div>
                <label className="label-mono text-xs text-dark/50 mb-1 block">Tipo de contribución</label>
                <select
                  value={founder.contribucion}
                  onChange={(e) => updateFounder('contribucion', e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  {CONTRIBUCION_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="label-mono text-xs text-dark/50 mb-1 block">Vesting</label>
                <select
                  value={founder.vesting}
                  onChange={(e) => updateFounder('vesting', e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  {Object.entries(VESTING_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {founder.contribucion === 'Capital en efectivo' && (
                <div>
                  <label className="label-mono text-xs text-dark/50 mb-1 block">Monto en USD</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-dark/40">USD</span>
                    <input
                      type="number"
                      min={0}
                      value={founder.montoCapital || ''}
                      onChange={(e) => updateFounder('montoCapital', Number(e.target.value))}
                      placeholder="0"
                      className="input-field pl-12"
                    />
                  </div>
                  <p className="font-sans text-xs text-dark/40 mt-1">Dispara un Contribution Agreement automático</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary info */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-dark/20 bg-dark/5">
            <div className="label-mono text-xs text-dark/50 mb-2">Caso recomendado</div>
            <div className="font-mono text-sm font-bold">
              {casoRecomendado === 'CASO_3' && 'SAS en DEZ + LEC'}
              {casoRecomendado === 'CASO_4' && 'Delaware + SAS en DEZ + LEC'}
              {casoRecomendado === 'CASO_1' && 'SAS / Delaware (sin LEC)'}
              {(!casoRecomendado || casoRecomendado === 'CASO_2') && 'A determinar'}
            </div>
          </div>
          <div className="p-4 border border-dark/20 bg-dark/5">
            <div className="label-mono text-xs text-dark/50 mb-2">Estado LEC</div>
            <div className="font-mono text-sm font-bold">
              {lecStatus === 'eligible' && 'Elegible para LEC'}
              {lecStatus === 'ruta_express' && 'Ruta Express (Art. 6°)'}
              {lecStatus === 'no_lec' && 'Sin elegibilidad LEC'}
              {!lecStatus && '—'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => router.back()} className="btn-secondary">← Volver</button>
          <button
            onClick={() => router.push('/onboarding/estructura')}
            disabled={!canContinue}
            className={`flex-1 font-mono font-bold px-6 py-3 border-2 transition-all duration-100 ${
              canContinue
                ? 'bg-orange text-dark border-dark shadow-[4px_4px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer'
                : 'bg-dark/10 text-dark/30 border-dark/20 cursor-not-allowed'
            }`}
          >
            Ver mi recomendación →
          </button>
        </div>

        {!canContinue && (
          <p className="font-sans text-xs text-dark/40 mt-2 text-center">
            {!founder?.nombre?.trim()
              ? 'Ingresá tu nombre para continuar'
              : myEquity <= 0
              ? 'Indicá tu porcentaje de equity para continuar'
              : 'Revisá los datos para continuar'}
          </p>
        )}
      </div>
    </div>
  )
}
