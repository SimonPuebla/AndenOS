'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, FileText } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { createClient } from '@/lib/supabase/client'

const ACTIVITY_LABELS: Record<string, string> = {
  software_saas_ia: 'Software / SaaS / IA',
  crypto_web3_defi: 'Crypto / Web3 / DeFi',
  produccion_audiovisual: 'Producción audiovisual',
  biotecnologia: 'Biotecnología',
  servicios_profesionales: 'Servicios profesionales',
  industria_4: 'Industria 4.0 / IoT',
  nanotecnologia: 'Nanotecnología',
  otra: 'Otra',
}

const VESTING_LABELS: Record<string, string> = {
  '4y_1c': '4 años, cliff 1 año',
  '3y_6m': '3 años, cliff 6 meses',
  sin_vesting: 'Sin vesting',
  a_definir: 'A definir',
}

function DocumentPlaceholder({ title, locked = true }: { title: string; locked?: boolean }) {
  return (
    <div className={`p-4 border-2 ${locked ? 'border-dark/20 bg-dark/5' : 'border-dark bg-cream'} relative overflow-hidden`}>
      <div className="flex items-center gap-2 mb-2">
        <FileText className={`w-4 h-4 ${locked ? 'text-dark/30' : 'text-dark'}`} />
        <span className={`font-mono text-xs font-bold ${locked ? 'text-dark/40' : 'text-dark'}`}>
          {title}
        </span>
        {locked && <Lock className="w-3 h-3 text-dark/30 ml-auto" />}
      </div>
      {locked && (
        <div className="font-mono text-xs text-dark/25 leading-relaxed select-none">
          [BLOQUEADO — Completar registro para generar]
        </div>
      )}
      {/* Watermark */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="font-mono text-xs text-dark/10 rotate-[-30deg] whitespace-nowrap text-2xl font-bold">
            ANDÉN CONFIDENCIAL
          </div>
        </div>
      )}
    </div>
  )
}

export default function RegistroPage() {
  const router = useRouter()
  const store = useOnboardingStore()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'summary' | 'register'>('summary')

  const caso = store.structureSelected || store.casoRecomendado || 'CASO_3'
  const priceBase = caso === 'CASO_4' ? 890 : 490
  const priceAdvisor = store.advisorMode === 'asesor' ? 290 : 0
  const totalPrice = priceBase + priceAdvisor

  const actividadLabel = store.actividad ? ACTIVITY_LABELS[store.actividad] : '—'

  // Documents based on case
  const docs = [
    'Estatuto SAS',
    'Checklist de constitución paso a paso',
    ...(store.capTable.length > 1 ? ['Founders Agreement'] : []),
    ...(store.ipAssignmentRequired ? ['IP Assignment Agreement'] : []),
    ...(caso === 'CASO_4' ? ['Certificate of Incorporation Delaware', 'Intercompany Agreement', 'SAFE template'] : []),
    ...(store.lecStatus !== 'no_lec' ? ['Solicitud de inscripción LEC', 'Declaración de actividades promovidas'] : []),
  ]

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (!nombre.trim()) {
      setError('Ingresá tu nombre completo')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: nombre,
            onboarding_state: JSON.stringify({
              actividad: store.actividad,
              porcentajeFacturacion: store.porcentajeFacturacion,
              cantidadFounders: store.cantidadFounders,
              ubicacionEquipo: store.ubicacionEquipo,
              etapa: store.etapa,
              mercado: store.mercado,
              inversion: store.inversion,
              moneda: store.moneda,
              empleados: store.empleados,
              ipPreexistente: store.ipPreexistente,
              nombreEmpresa: store.nombreEmpresa,
              capTable: store.capTable,
              structureSelected: store.structureSelected,
              casoRecomendado: store.casoRecomendado,
              advisorMode: store.advisorMode,
              lecStatus: store.lecStatus,
            }),
          },
        },
      })

      if (authError) throw authError

      // Upsert expediente in DB
      if (data.user) {
        await supabase.from('expedientes').upsert({
          user_id: data.user.id,
          caso: caso,
          lec_status: store.lecStatus,
          advisor_mode: store.advisorMode,
          onboarding_data: {
            actividad: store.actividad,
            etapa: store.etapa,
            mercado: store.mercado,
            inversion: store.inversion,
            moneda: store.moneda,
            empleados: store.empleados,
            ipPreexistente: store.ipPreexistente,
            nombreEmpresa: store.nombreEmpresa,
            capTable: store.capTable,
          },
          payment_status: 'pending',
          status: 'onboarding',
        })
      }

      // Redirect to paywall
      router.push('/onboarding/registro/pago')
    } catch (err) {
      const e = err as { message?: string }
      setError(e.message || 'Error al crear la cuenta. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
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
            <ProgressBar current={5} total={5} label="Registro" />
          </div>
          <div className="font-mono text-xs text-dark/40 hidden md:block">Paso 5 de 5</div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {step === 'summary' && (
          <>
            <div className="mb-8">
              <div className="font-mono text-xs text-orange uppercase tracking-wider mb-2">Tu expediente</div>
              <h1 className="font-mono text-2xl md:text-3xl font-bold text-dark mb-3">
                Resumen antes de registrarte
              </h1>
              <p className="font-sans text-dark/60">
                Revisá todo lo que armamos. Al registrarte, guardamos este expediente y podés proceder al pago.
              </p>
            </div>

            {/* Company profile */}
            <div className="card mb-6">
              <div className="label-mono text-dark/50 mb-4">Perfil de la empresa</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Actividad', actividadLabel],
                  ['Etapa', store.etapa || '—'],
                  ['Mercado', store.mercado || '—'],
                  ['Moneda', store.moneda || '—'],
                  ['Empleados', store.empleados || '—'],
                  ['IP pre-existente', store.ipPreexistente === 'no' ? 'No' : 'Sí'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="font-mono text-xs text-dark/40 uppercase tracking-wider">{label}</div>
                    <div className="font-sans text-sm text-dark mt-0.5 capitalize">{String(value).replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cap table */}
            <div className="card mb-6 relative overflow-hidden">
              <div className="label-mono text-dark/50 mb-4">Cap table</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-dark">
                      <th className="font-mono text-xs text-dark/50 text-left py-2 pr-4">Nombre</th>
                      <th className="font-mono text-xs text-dark/50 text-left py-2 pr-4">Rol</th>
                      <th className="font-mono text-xs text-dark/50 text-right py-2 pr-4">Equity</th>
                      <th className="font-mono text-xs text-dark/50 text-left py-2">Vesting</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.capTable.map((m) => (
                      <tr key={m.id} className="border-b border-dark/10">
                        <td className="py-2 pr-4 font-sans text-dark blur-[3px]">{m.nombre || '—'}</td>
                        <td className="py-2 pr-4 font-sans text-dark/70">{m.rol}</td>
                        <td className="py-2 pr-4 font-mono font-bold text-right">{m.equity}%</td>
                        <td className="py-2 font-sans text-dark/60 text-xs">{VESTING_LABELS[m.vesting]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Confidential watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="font-mono text-dark/8 rotate-[-30deg] whitespace-nowrap text-3xl font-bold">
                  ANDÉN CONFIDENCIAL
                </div>
              </div>
            </div>

            {/* Structure */}
            <div className="card mb-6">
              <div className="label-mono text-dark/50 mb-3">Estructura elegida</div>
              <div className="font-mono text-lg font-bold">
                {caso === 'CASO_4' ? 'Delaware + SAS en DEZ + LEC' : caso === 'CASO_3' ? 'SAS en DEZ + LEC' : 'SAS (sin LEC)'}
              </div>
              <div className="font-sans text-sm text-dark/60 mt-1">
                Modo: {store.advisorMode === 'asesor' ? 'Con asesor humano' : store.advisorMode === 'ai' ? 'Con guía Andén' : 'Proceso estándar'}
              </div>
            </div>

            {/* Documents */}
            <div className="mb-6">
              <div className="label-mono text-dark/50 mb-3">Documentos que se generarán</div>
              <div className="grid gap-2">
                {docs.map((doc) => (
                  <DocumentPlaceholder key={doc} title={doc} locked />
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="card mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-sans text-sm text-dark/60">Total del proceso</div>
                  <div className="font-mono text-2xl font-bold mt-1">USD {totalPrice}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-dark/40">Tiempo estimado</div>
                  <div className="font-mono text-sm font-bold mt-1">
                    {caso === 'CASO_4' ? '42' : '40'} días hábiles
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => router.back()} className="btn-secondary">← Volver</button>
              <button onClick={() => setStep('register')} className="flex-1 btn-primary text-center">
                Crear cuenta →
              </button>
            </div>
          </>
        )}

        {step === 'register' && (
          <>
            <div className="mb-8">
              <div className="font-mono text-xs text-orange uppercase tracking-wider mb-2">Crear cuenta</div>
              <h1 className="font-mono text-2xl md:text-3xl font-bold text-dark mb-3">
                Registrate para guardar tu expediente
              </h1>
              <p className="font-sans text-dark/60">
                Creamos tu cuenta y guardamos todo el trabajo que hiciste. Después del registro, procedés al pago.
              </p>
            </div>

            <div className="card">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label-mono text-xs text-dark/50 mb-1 block">Nombre completo</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="María González"
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-mono text-xs text-dark/50 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maria@startup.com"
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-mono text-xs text-dark/50 mb-1 block">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-mono text-xs text-dark/50 mb-1 block">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetir contraseña"
                    required
                    className="input-field"
                  />
                </div>

                {error && (
                  <div className="p-3 border-2 border-red-400 bg-red-50">
                    <p className="font-sans text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={() => setStep('summary')} className="btn-secondary">
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta y continuar →'}
                  </button>
                </div>

                <p className="font-sans text-xs text-dark/40 text-center">
                  Al registrarte aceptás los términos de servicio. Tu información es confidencial.
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
