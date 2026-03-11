'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
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

function emptyMember(): CapTableMember {
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
  const { capTable, setCapTable, casoRecomendado, lecStatus } = useOnboardingStore()

  useEffect(() => {
    if (capTable.length === 0) {
      setCapTable([emptyMember()])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalEquity = capTable.reduce((sum, m) => sum + (Number(m.equity) || 0), 0)
  const equityOk = totalEquity === 100
  const equityOver = totalEquity > 100
  const noOptionPool = equityOk && !capTable.some((m) => m.rol === 'Inversor' || m.rol === 'Advisor')

  const updateMember = (id: string, field: keyof CapTableMember, value: string | number) => {
    setCapTable(
      capTable.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const addMember = () => {
    setCapTable([...capTable, emptyMember()])
  }

  const removeMember = (id: string) => {
    if (capTable.length <= 1) return
    setCapTable(capTable.filter((m) => m.id !== id))
  }

  const canContinue = capTable.every((m) => m.nombre.trim()) && totalEquity <= 100 && capTable.length > 0

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
          <div className="font-mono text-xs text-dark/40 hidden md:block">
            Paso 2 de 5
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="font-mono text-xs text-orange uppercase tracking-wider mb-2">Paso 2 — Cap table</div>
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-dark mb-3">
            ¿Cómo se distribuye el equity?
          </h1>
          <p className="font-sans text-dark/60">
            Agregá a cada persona con participación en la empresa. Podés ajustar esto antes de avanzar.
          </p>
        </div>

        {/* Equity bar */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="label-mono">Equity total</div>
            <div className={`font-mono text-2xl font-bold ${equityOk ? 'text-green-600' : equityOver ? 'text-red-500' : 'text-dark'}`}>
              {totalEquity}%
            </div>
          </div>
          <div className="h-4 bg-dark/10 border border-dark/20 w-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${equityOk ? 'bg-green-500' : equityOver ? 'bg-red-500' : 'bg-orange'}`}
              style={{ width: `${Math.min(totalEquity, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-xs text-dark/40">0%</span>
            <span className="font-mono text-xs text-dark/40">100%</span>
          </div>

          {equityOk && (
            <div className="flex items-center gap-2 mt-3 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-mono text-xs font-bold">Equity completo</span>
            </div>
          )}
          {equityOver && (
            <div className="flex items-center gap-2 mt-3 text-red-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono text-xs font-bold">El equity supera 100% — revisá los valores</span>
            </div>
          )}
          {noOptionPool && equityOk && (
            <div className="flex items-start gap-2 mt-2 p-3 bg-orange/10 border border-orange">
              <AlertTriangle className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" />
              <div className="font-sans text-xs text-dark/70">
                <strong className="font-mono text-dark">Sugerencia:</strong> Considerá reservar un 10–20% como option pool para futuros empleados e inversores.
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="space-y-3 mb-6">
          {capTable.map((member, idx) => (
            <div key={member.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="label-mono text-dark/50">Integrante {idx + 1}</div>
                {capTable.length > 1 && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="w-7 h-7 border border-dark/30 flex items-center justify-center hover:bg-dark hover:text-cream hover:border-dark transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="label-mono text-xs text-dark/50 mb-1 block">Nombre completo</label>
                  <input
                    type="text"
                    value={member.nombre}
                    onChange={(e) => updateMember(member.id, 'nombre', e.target.value)}
                    placeholder="Ej: María González"
                    className="input-field"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="label-mono text-xs text-dark/50 mb-1 block">Rol</label>
                  <select
                    value={member.rol}
                    onChange={(e) => updateMember(member.id, 'rol', e.target.value)}
                    className="input-field appearance-none cursor-pointer"
                  >
                    {ROL_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Equity */}
                <div>
                  <label className="label-mono text-xs text-dark/50 mb-1 block">% Equity</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={member.equity || ''}
                      onChange={(e) => updateMember(member.id, 'equity', Number(e.target.value))}
                      placeholder="0"
                      className="input-field pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-dark/40">%</span>
                  </div>
                </div>

                {/* Contribución */}
                <div>
                  <label className="label-mono text-xs text-dark/50 mb-1 block">Tipo de contribución</label>
                  <select
                    value={member.contribucion}
                    onChange={(e) => updateMember(member.id, 'contribucion', e.target.value)}
                    className="input-field appearance-none cursor-pointer"
                  >
                    {CONTRIBUCION_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Vesting */}
                <div>
                  <label className="label-mono text-xs text-dark/50 mb-1 block">Vesting</label>
                  <select
                    value={member.vesting}
                    onChange={(e) => updateMember(member.id, 'vesting', e.target.value)}
                    className="input-field appearance-none cursor-pointer"
                  >
                    {Object.entries(VESTING_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Capital amount if cash contribution */}
                {member.contribucion === 'Capital en efectivo' && (
                  <div>
                    <label className="label-mono text-xs text-dark/50 mb-1 block">Monto en USD</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-dark/40">USD</span>
                      <input
                        type="number"
                        min={0}
                        value={member.montoCapital || ''}
                        onChange={(e) => updateMember(member.id, 'montoCapital', Number(e.target.value))}
                        placeholder="0"
                        className="input-field pl-12"
                      />
                    </div>
                    <p className="font-sans text-xs text-dark/40 mt-1">
                      Dispara un Contribution Agreement automático
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add member */}
        <button
          onClick={addMember}
          className="w-full border-2 border-dashed border-dark/30 py-3 font-mono text-sm text-dark/50 hover:border-orange hover:text-orange transition-colors flex items-center justify-center gap-2 mb-8"
        >
          <Plus className="w-4 h-4" />
          Agregar integrante
        </button>

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

        {/* Continue */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            ← Volver
          </button>
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
            {capTable.some((m) => !m.nombre.trim())
              ? 'Completá el nombre de todos los integrantes'
              : equityOver
              ? 'El equity total no puede superar 100%'
              : 'Completá la tabla para continuar'}
          </p>
        )}
      </div>
    </div>
  )
}
