'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, FileText, CheckSquare, Clock, MessageSquare, User, Zap, Building2, Plus, Trash2, type LucideIcon } from 'lucide-react'
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

type Responsible = 'vos' | 'andén' | 'institución'

const RESPONSIBLE_CONFIG: Record<Responsible, { icon: LucideIcon; label: string; className: string }> = {
  vos: { icon: User, label: 'Vos', className: 'border-dark/30 text-dark bg-dark/5' },
  'andén': { icon: Zap, label: 'Andén puede gestionarlo', className: 'border-orange text-dark bg-orange/10' },
  'institución': { icon: Building2, label: 'Institución', className: 'border-dark/20 text-dark/60 bg-dark/5' },
}

function ResponsibleBadge({ responsible }: { responsible: Responsible }) {
  const cfg = RESPONSIBLE_CONFIG[responsible]
  const Icon = cfg.icon
  return (
    <span className={`flex items-center gap-1 font-mono text-xs border px-1.5 py-0.5 flex-shrink-0 ${cfg.className}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

const PARALLEL_TASKS: { key: string; label: string; time: string; responsible: Responsible }[] = [
  { key: 'banco', label: 'Abrir cuenta bancaria empresarial', time: 'Semana 2', responsible: 'vos' },
  { key: 'marca', label: 'Registrar marca / dominio', time: 'Semana 1', responsible: 'andén' },
  { key: 'tools', label: 'Configurar Stripe, Wise, facturación', time: 'Semana 1', responsible: 'vos' },
  { key: 'contrato', label: 'Preparar contrato con primer cliente', time: 'Semana 2–3', responsible: 'andén' },
  { key: 'redes', label: 'Configurar perfiles corporativos', time: 'Semana 1', responsible: 'vos' },
  { key: 'documentos', label: 'Firmar los documentos cuando te los enviemos', time: 'Semana 1–3', responsible: 'vos' },
]

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'

  const [expediente, setExpediente] = useState<Expediente | null>(null)
  const [loading, setLoading] = useState(true)
  const [parallelChecked, setParallelChecked] = useState<Record<string, boolean>>({})
  const [capTableDraft, setCapTableDraft] = useState<{ nombre: string; rol: string; equity: number; contribucion: string; vesting: string }[]>([])
  const [capTableSaving, setCapTableSaving] = useState(false)
  const [capTableSaved, setCapTableSaved] = useState(false)

  function addCoFounderRow() {
    setCapTableDraft((d) => [...d, { nombre: '', rol: 'Co-founder', equity: 0, contribucion: 'Sweat equity', vesting: '4y_1c' }])
  }

  function updateCoFounder(idx: number, field: string, value: string | number) {
    setCapTableDraft((d) => d.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  function removeCoFounder(idx: number) {
    setCapTableDraft((d) => d.filter((_, i) => i !== idx))
  }

  async function saveCapTable() {
    if (!expediente) return
    setCapTableSaving(true)
    try {
      const supabase = createClient()
      const existingCap = (expediente.onboarding_data?.capTable as unknown[]) || []
      const newCap = [...existingCap, ...capTableDraft]
      await supabase
        .from('expedientes')
        .update({ onboarding_data: { ...expediente.onboarding_data, capTable: newCap } })
        .eq('id', expediente.id)
      setExpediente({ ...expediente, onboarding_data: { ...expediente.onboarding_data, capTable: newCap } })
      setCapTableDraft([])
      setCapTableSaved(true)
    } finally {
      setCapTableSaving(false)
    }
  }
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

            {/* Cap table completion */}
            {(() => {
              const data = expediente.onboarding_data || {}
              const cantidadFounders = data.cantidadFounders as string | undefined
              const existingCap = (data.capTable as { nombre: string }[]) || []
              const needsMore = (cantidadFounders === 'dos' && existingCap.length < 2) ||
                                (cantidadFounders === 'tres_plus' && existingCap.length < 3)
              if (!needsMore && capTableDraft.length === 0) return null
              return (
                <div className="card border-orange">
                  <div className="flex items-center justify-between mb-3">
                    <div className="label-mono text-dark/50">Cap table — co-founders</div>
                    {capTableSaved && (
                      <span className="font-mono text-xs text-green-600 border border-green-300 bg-green-50 px-2 py-0.5">Guardado</span>
                    )}
                  </div>
                  <p className="font-sans text-sm text-dark/60 mb-4">
                    Completá los datos de tus co-founders para finalizar el cap table.
                  </p>

                  {/* Existing members */}
                  {existingCap.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border border-dark/10 bg-dark/5 mb-2">
                      <div className="w-4 h-4 bg-dark flex items-center justify-center flex-shrink-0">
                        <span className="text-cream text-xs">✓</span>
                      </div>
                      <span className="font-mono text-xs text-dark/60 flex-1">{m.nombre}</span>
                      <span className="font-mono text-xs text-dark/40">Ya cargado</span>
                    </div>
                  ))}

                  {/* Draft rows */}
                  {capTableDraft.map((row, idx) => (
                    <div key={idx} className="border border-dark/20 p-3 mb-2 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-dark/50">Co-founder {existingCap.length + idx + 1}</span>
                        <button onClick={() => removeCoFounder(idx)} className="w-6 h-6 border border-dark/20 flex items-center justify-center hover:bg-dark hover:text-cream">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={row.nombre}
                            onChange={(e) => updateCoFounder(idx, 'nombre', e.target.value)}
                            placeholder="Nombre completo"
                            className="input-field text-sm"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min={0} max={100}
                            value={row.equity || ''}
                            onChange={(e) => updateCoFounder(idx, 'equity', Number(e.target.value))}
                            placeholder="% equity"
                            className="input-field text-sm pr-6"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-dark/40">%</span>
                        </div>
                        <select
                          value={row.vesting}
                          onChange={(e) => updateCoFounder(idx, 'vesting', e.target.value)}
                          className="input-field text-sm appearance-none cursor-pointer"
                        >
                          <option value="4y_1c">4 años, cliff 1 año</option>
                          <option value="3y_6m">3 años, cliff 6 meses</option>
                          <option value="sin_vesting">Sin vesting</option>
                          <option value="a_definir">A definir</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={addCoFounderRow}
                      className="flex items-center gap-2 border border-dashed border-dark/30 px-3 py-2 font-mono text-xs text-dark/50 hover:border-orange hover:text-orange transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Agregar co-founder
                    </button>
                    {capTableDraft.length > 0 && (
                      <button
                        onClick={saveCapTable}
                        disabled={capTableSaving || capTableDraft.some(r => !r.nombre.trim())}
                        className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {capTableSaving ? 'Guardando...' : 'Guardar cap table'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}

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
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="label-mono text-dark/50">Tareas pendientes</div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ResponsibleBadge responsible="vos" />
                  <ResponsibleBadge responsible="andén" />
                </div>
              </div>
              <p className="font-sans text-sm text-dark/60 mb-4">
                Las tareas marcadas con <span className="font-mono text-xs border border-orange bg-orange/10 px-1">Andén</span> podés delegárselas al equipo.
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono text-xs text-dark/40">{task.time}</span>
                      <ResponsibleBadge responsible={task.responsible} />
                    </div>
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
