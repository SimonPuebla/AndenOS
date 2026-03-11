'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, FileText, CheckSquare, Clock, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Expediente {
  id: string
  expediente_id: string
  caso: string
  lec_status: string
  advisor_mode: string
  status: string
  payment_status: string
  amount_paid: number
  paid_at: string
  onboarding_data: Record<string, unknown>
}

interface Document {
  title: string
  status: 'pending' | 'ready' | 'signed'
  content?: string
}

const STATUS_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  en_revision: 'En revisión por el equipo Andén',
  en_proceso: 'En proceso',
  completado: 'Completado',
}

const STATUS_COLORS: Record<string, string> = {
  onboarding: 'bg-dark/10 text-dark',
  en_revision: 'bg-orange/20 text-dark border-orange',
  en_proceso: 'bg-blue/20 text-blue',
  completado: 'bg-green-100 text-green-700',
}

const VESTING_LABELS: Record<string, string> = {
  '4y_1c': '4 años, cliff 1 año',
  '3y_6m': '3 años, cliff 6 meses',
  sin_vesting: 'Sin vesting',
  a_definir: 'A definir',
}

function buildDocuments(expediente: Expediente): Document[] {
  const data = expediente.onboarding_data || {}
  const capTable = (data.capTable as Array<{ nombre: string; rol: string; equity: number; contribucion: string; vesting: string }>) || []
  const caso = expediente.caso

  const docs: Document[] = []

  // Estatuto SAS — ready with placeholder data
  docs.push({
    title: 'Estatuto SAS',
    status: 'ready',
    content: `ESTATUTO SOCIAL
Sociedad por Acciones Simplificada

OBJETO SOCIAL: [A CONFIRMAR CON ASESOR]
CAPITAL SOCIAL: [PENDIENTE]
DOMICILIO: Zona Franca Digital, Mendoza, Argentina

SOCIOS FUNDADORES:
${capTable.map((m) => `  - ${m.nombre} — ${m.equity}% (${m.rol})`).join('\n') || '  [PENDIENTE]'}

DISTRIBUCIÓN DE UTILIDADES: Según participación accionaria.
CLÁUSULA DE VESTING: Según Founders Agreement.

[DOCUMENTO EN REVISIÓN — Versión definitiva sujeta a revisión legal]`,
  })

  // Checklist
  docs.push({
    title: 'Checklist de constitución',
    status: 'ready',
    content: `CHECKLIST DE CONSTITUCIÓN
Andén — Expediente ${expediente.expediente_id || '[PENDIENTE]'}

PASOS COMPLETADOS:
☑ Diagnóstico realizado
☑ Cap table definido
☑ Estructura seleccionada
☑ Pago procesado

PRÓXIMOS PASOS:
☐ Elaboración estatuto SAS
☐ Reserva de nombre IGJ
☐ Presentación ante IGJ
☐ Obtención CUIT provisorio
☐ Inscripción Zona Franca Digital
☐ Inscripción LEC — MINCYT
☐ CUIT definitivo`,
  })

  // Founders Agreement (if multiple founders)
  if (capTable.length > 1) {
    docs.push({
      title: 'Founders Agreement',
      status: 'ready',
      content: `FOUNDERS AGREEMENT
Entre: ${capTable.map((m) => m.nombre).join(' y ')}

DISTRIBUCIÓN DE EQUITY:
${capTable.map((m) => `  ${m.nombre}: ${m.equity}% — ${m.contribucion}`).join('\n')}

VESTING:
${capTable.map((m) => `  ${m.nombre}: ${VESTING_LABELS[m.vesting] || m.vesting}`).join('\n')}

RESOLUCIÓN DE CONFLICTOS: [A DEFINIR CON ASESOR]
SALIDA DE FOUNDERS: [A DEFINIR CON ASESOR]

[BLOQUEADO — Documento en revisión por el equipo Andén]`,
    })
  }

  // IP Assignment
  if (data.ipPreexistente && data.ipPreexistente !== 'no') {
    docs.push({
      title: 'IP Assignment Agreement',
      status: 'pending',
      content: undefined,
    })
  }

  // Delaware docs
  if (caso === 'CASO_4') {
    docs.push(
      { title: 'Certificate of Incorporation (Delaware)', status: 'pending' },
      { title: 'Intercompany Agreement', status: 'pending' },
      { title: 'SAFE Template', status: 'pending' }
    )
  }

  // LEC docs
  if (expediente.lec_status !== 'no_lec') {
    docs.push(
      { title: 'Solicitud de inscripción LEC', status: 'pending' },
      { title: 'Declaración de actividades promovidas', status: 'pending' }
    )
  }

  return docs
}

const PARALLEL_TASKS = [
  { key: 'banco', label: 'Abrir cuenta bancaria empresarial', time: 'Semana 2' },
  { key: 'marca', label: 'Registrar marca / dominio', time: 'Semana 1' },
  { key: 'tools', label: 'Configurar Stripe, Wise, facturación', time: 'Semana 1' },
  { key: 'contrato', label: 'Preparar contrato con primer cliente', time: 'Semana 2–3' },
  { key: 'redes', label: 'Configurar perfiles corporativos', time: 'Semana 1' },
]

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'

  const [expediente, setExpediente] = useState<Expediente | null>(null)
  const [loading, setLoading] = useState(true)
  const [parallelChecked, setParallelChecked] = useState<Record<string, boolean>>({})
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, unknown> } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push('/onboarding/registro')
          return
        }

        setUser(user)

        const { data: exp } = await supabase
          .from('expedientes')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!exp) {
          router.push('/onboarding')
          return
        }

        if (exp.payment_status !== 'paid') {
          router.push('/onboarding/registro/pago')
          return
        }

        setExpediente(exp)
        setLoading(false)
      } catch {
        router.push('/onboarding/registro')
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="font-mono text-dark/40">Cargando tu expediente...</div>
      </div>
    )
  }

  if (!expediente) return null

  const docs = buildDocuments(expediente)
  const founderName = (user?.user_metadata?.full_name as string) || 'Founder'
  const casoLabel: Record<string, string> = {
    CASO_1: 'SAS simple',
    CASO_3: 'SAS en DEZ + LEC',
    CASO_4: 'Delaware + SAS en DEZ + LEC',
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b-2 border-dark bg-cream sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-xl tracking-tight">
            ANDÉN<span className="text-orange">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-dark/40 hidden md:block">{user?.email}</div>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/')
              }}
              className="font-mono text-xs text-dark/50 hover:text-dark border border-dark/20 px-3 py-1.5"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Payment success banner */}
      {paymentSuccess && (
        <div className="bg-orange border-b-2 border-dark">
          <div className="max-w-6xl mx-auto px-4 py-3 text-center font-mono text-sm font-bold text-dark">
            Pago recibido. Tu expediente está en manos del equipo Andén.
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="font-mono text-xs text-dark/40 uppercase tracking-wider mb-1">
            Expediente {expediente.expediente_id || 'procesando...'}
          </div>
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-dark">
            Hola, {founderName.split(' ')[0]}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status card */}
            <div className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="label-mono text-dark/50 mb-1">Estado del expediente</div>
                  <div className={`tag inline-block px-3 py-1 border ${STATUS_COLORS[expediente.status] || 'bg-cream'}`}>
                    {STATUS_LABELS[expediente.status] || expediente.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-dark/40">Estructura</div>
                  <div className="font-mono text-sm font-bold mt-0.5">
                    {casoLabel[expediente.caso] || expediente.caso}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange/10 border border-orange">
                <div className="font-mono text-xs font-bold mb-1">PRÓXIMO PASO</div>
                <div className="font-sans text-sm text-dark">
                  Nuestro equipo está revisando tu expediente. Recibirás un email en las próximas 24 horas hábiles con la confirmación de inicio del proceso.
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="card">
              <div className="label-mono text-dark/50 mb-4">Documentos</div>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.title}
                    className={`flex items-center gap-3 p-3 border transition-colors ${
                      doc.status === 'ready'
                        ? 'border-dark cursor-pointer hover:border-orange hover:bg-orange/5'
                        : doc.status === 'signed'
                        ? 'border-green-400 bg-green-50'
                        : 'border-dark/20 bg-dark/5 cursor-default'
                    }`}
                    onClick={() => doc.status === 'ready' && setSelectedDoc(doc)}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 ${
                      doc.status === 'ready' ? 'bg-dark text-cream' :
                      doc.status === 'signed' ? 'bg-green-500 text-white' :
                      'bg-dark/10 text-dark/30'
                    }`}>
                      {doc.status === 'pending' ? <Lock className="w-3 h-3" /> :
                       doc.status === 'ready' ? <FileText className="w-3 h-3" /> :
                       <CheckSquare className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-mono text-sm font-bold truncate ${doc.status === 'pending' ? 'text-dark/40' : 'text-dark'}`}>
                        {doc.title}
                      </div>
                    </div>
                    <div className={`tag text-xs flex-shrink-0 ${
                      doc.status === 'pending' ? 'bg-dark/10 text-dark/30 border-dark/10' :
                      doc.status === 'ready' ? 'bg-orange text-dark border-orange' :
                      'bg-green-100 text-green-700 border-green-300'
                    }`}>
                      {doc.status === 'pending' ? 'Pendiente' : doc.status === 'ready' ? 'Listo' : 'Firmado'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doc viewer modal */}
            {selectedDoc && (
              <div className="fixed inset-0 bg-dark/50 z-50 flex items-center justify-center p-4">
                <div className="bg-cream border-2 border-dark shadow-[6px_6px_0px_#1A1A2E] w-full max-w-2xl max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b-2 border-dark">
                    <div className="font-mono text-sm font-bold">{selectedDoc.title}</div>
                    <button
                      onClick={() => setSelectedDoc(null)}
                      className="w-7 h-7 border border-dark flex items-center justify-center font-mono hover:bg-dark hover:text-cream"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto flex-1">
                    <pre className="font-mono text-xs text-dark/70 whitespace-pre-wrap leading-relaxed">
                      {selectedDoc.content}
                    </pre>
                  </div>
                  <div className="p-4 border-t-2 border-dark bg-dark/5">
                    <p className="font-sans text-xs text-dark/50">
                      Documento preliminar. La versión final será revisada y confirmada por el equipo legal de Andén.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Parallel actions */}
            <div className="card">
              <div className="label-mono text-dark/50 mb-2">Mientras esperás</div>
              <p className="font-sans text-sm text-dark/60 mb-4">
                Estas acciones podés hacerlas en paralelo mientras Andén gestiona el proceso legal.
              </p>
              <div className="space-y-2">
                {PARALLEL_TASKS.map((task) => (
                  <div
                    key={task.key}
                    className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                      parallelChecked[task.key] ? 'border-dark/20 bg-dark/5' : 'border-dark/20 hover:border-dark'
                    }`}
                    onClick={() => setParallelChecked((p) => ({ ...p, [task.key]: !p[task.key] }))}
                  >
                    <div className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 ${parallelChecked[task.key] ? 'bg-dark border-dark' : 'border-dark'}`}>
                      {parallelChecked[task.key] && <span className="text-cream text-xs">✓</span>}
                    </div>
                    <span className={`font-sans text-sm flex-1 ${parallelChecked[task.key] ? 'line-through text-dark/40' : 'text-dark'}`}>
                      {task.label}
                    </span>
                    <span className="font-mono text-xs text-dark/40 flex-shrink-0">{task.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Expediente info */}
            <div className="card">
              <div className="label-mono text-dark/50 mb-4">Tu expediente</div>
              <div className="space-y-3">
                <div>
                  <div className="font-mono text-xs text-dark/40 uppercase">N° Expediente</div>
                  <div className="font-mono text-sm font-bold mt-0.5">{expediente.expediente_id || 'Procesando...'}</div>
                </div>
                <div>
                  <div className="font-mono text-xs text-dark/40 uppercase">LEC</div>
                  <div className="font-sans text-sm mt-0.5">
                    {expediente.lec_status === 'eligible' ? 'Elegible' :
                     expediente.lec_status === 'ruta_express' ? 'Ruta Express' : 'Sin LEC'}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-dark/40 uppercase">Monto pagado</div>
                  <div className="font-mono text-sm font-bold mt-0.5">USD {expediente.amount_paid}</div>
                </div>
                {expediente.paid_at && (
                  <div>
                    <div className="font-mono text-xs text-dark/40 uppercase">Fecha de pago</div>
                    <div className="font-sans text-xs text-dark/60 mt-0.5">
                      {new Date(expediente.paid_at).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline mini */}
            <div className="card">
              <div className="label-mono text-dark/50 mb-4">Hitos del proceso</div>
              <div className="space-y-3">
                {[
                  { label: 'Diagnóstico', done: true },
                  { label: 'Pago recibido', done: true },
                  { label: 'En revisión', done: expediente.status !== 'onboarding', active: expediente.status === 'en_revision' },
                  { label: 'En trámite', done: expediente.status === 'completado' || expediente.status === 'en_proceso' },
                  { label: 'Completado', done: expediente.status === 'completado' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${
                      item.done ? 'bg-dark border-dark' :
                      item.active ? 'bg-orange border-orange' :
                      'border-dark/20'
                    }`}>
                      {item.done && <span className="text-cream text-xs">✓</span>}
                      {item.active && <div className="w-2 h-2 bg-dark" />}
                    </div>
                    <span className={`font-mono text-xs ${item.done || item.active ? 'text-dark font-bold' : 'text-dark/30'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="card">
              <div className="label-mono text-dark/50 mb-3">Contacto</div>
              <p className="font-sans text-sm text-dark/60 mb-3">
                ¿Tenés dudas sobre el proceso?
              </p>
              <a
                href={`mailto:hello@anden.tech?subject=Consulta expediente ${expediente.expediente_id}&body=Hola equipo Andén,%0A%0AExpediente: ${expediente.expediente_id}%0A%0AConsulta:`}
                className="flex items-center gap-2 btn-secondary w-full justify-center text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Hablar con mi asesor
              </a>
              <p className="font-mono text-xs text-dark/30 mt-2 text-center">hello@anden.tech</p>
            </div>

            {/* Time estimate */}
            <div className="p-4 border border-dark/20 bg-dark/5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-dark/40" />
                <div className="font-mono text-xs font-bold text-dark/50">TIEMPO ESTIMADO</div>
              </div>
              <div className="font-mono text-lg font-bold">
                {expediente.caso === 'CASO_4' ? '42' : '40'} días hábiles
              </div>
              <p className="font-sans text-xs text-dark/40 mt-1">
                Desde el inicio del proceso legal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="font-mono text-dark/40">Cargando...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
