'use client'

import Link from 'next/link'
import { ArrowRight, Check, ChevronRight, Building2, Globe, Zap, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b-2 border-dark bg-cream sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-mono font-bold text-xl tracking-tight">
            ANDÉN<span className="text-orange">.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/onboarding/existente" className="font-mono text-sm hidden md:block hover:text-orange transition-colors">
              Ya tengo empresa
            </Link>
            <Link href="/onboarding" className="btn-primary text-sm py-2 px-4">
              Iniciá tu empresa
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="tag bg-orange text-dark mb-6 inline-block">
              Zona Franca Digital · Mendoza
            </div>
            <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
              Tu empresa tech,<br />
              constituida en<br />
              <span className="text-orange">35 días.</span>
            </h1>
            <p className="font-sans text-lg text-dark/70 mb-8 max-w-lg leading-relaxed">
              Andén te guía por todo el proceso de constitución en Argentina:
              SAS, Ley de Economía del Conocimiento, y Zona Franca Digital.
              Sin trámites, sin junta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/onboarding" className="btn-primary text-center">
                Iniciá tu empresa <ArrowRight className="inline ml-2 w-4 h-4" />
              </Link>
              <Link href="/onboarding/existente" className="btn-secondary text-center">
                Ya tengo empresa
              </Link>
            </div>
            <p className="font-mono text-xs text-dark/50 mt-4">
              Diagnóstico gratuito · Proceso 100% guiado
            </p>
          </div>

          {/* Hero card — simulated dashboard */}
          <div className="hidden md:block">
            <div className="card relative">
              <div className="font-mono text-xs text-dark/50 mb-4 uppercase tracking-wider">
                Expediente #AND-2024-0142
              </div>
              <div className="space-y-3">
                {[
                  { step: '01', label: 'Diagnóstico completado', status: 'done', days: 'Día 0' },
                  { step: '02', label: 'SAS constituida en IGJ', status: 'done', days: 'Día 8' },
                  { step: '03', label: 'Inscripción Zona Franca Digital', status: 'active', days: 'Día 18' },
                  { step: '04', label: 'Inscripción LEC — MINCYT', status: 'pending', days: 'Día 28' },
                  { step: '05', label: 'CUIT e inicio de operaciones', status: 'pending', days: 'Día 35' },
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`flex items-center gap-3 p-3 border ${
                      item.status === 'done'
                        ? 'border-dark bg-dark/5'
                        : item.status === 'active'
                        ? 'border-orange bg-orange/10'
                        : 'border-dark/20 bg-cream'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center border font-mono text-xs font-bold flex-shrink-0 ${
                        item.status === 'done'
                          ? 'bg-dark text-cream border-dark'
                          : item.status === 'active'
                          ? 'bg-orange text-dark border-orange'
                          : 'bg-cream text-dark/30 border-dark/20'
                      }`}
                    >
                      {item.status === 'done' ? '✓' : item.step}
                    </div>
                    <div className="flex-1">
                      <div className={`font-mono text-xs font-bold ${item.status === 'pending' ? 'text-dark/30' : 'text-dark'}`}>
                        {item.label}
                      </div>
                    </div>
                    <div className={`font-mono text-xs ${item.status === 'pending' ? 'text-dark/30' : 'text-dark/60'}`}>
                      {item.days}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-orange/10 border border-orange">
                <div className="font-mono text-xs font-bold text-dark mb-1">PRÓXIMO PASO</div>
                <div className="font-sans text-sm text-dark">
                  Presentar formulario ZF-01 ante la Zona Franca Mendoza. Andén lo gestiona por vos.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits bar */}
      <section className="border-y-2 border-dark bg-dark">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '60%', label: 'Reducción Imp. Ganancias' },
              { value: '70%', label: 'Bono crédito fiscal contrib.' },
              { value: '0%', label: 'Retención IVA exportaciones' },
              { value: '35d', label: 'Tiempo estimado proceso' },
            ].map((b) => (
              <div key={b.value}>
                <div className="font-mono text-2xl md:text-3xl font-bold text-orange">{b.value}</div>
                <div className="font-mono text-xs text-cream/70 mt-1">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is DEZ / LEC */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-orange border-2 border-dark flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-dark" />
              </div>
              <div>
                <div className="label-mono mb-1">Zona Franca Digital</div>
                <h2 className="font-mono text-xl font-bold">DEZ Mendoza</h2>
              </div>
            </div>
            <p className="font-sans text-dark/70 mb-4 leading-relaxed">
              La primera Zona Franca Digital de Argentina, ubicada en Mendoza.
              Empresas de economía del conocimiento operan con beneficios
              fiscales especiales sin mover físicamente sus oficinas.
            </p>
            <ul className="space-y-2">
              {[
                'Domicilio fiscal en zona franca',
                'Sin aranceles sobre software exportado',
                'Acceso a red de inversores DEZ',
                'Certificación internacional',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 font-sans text-sm">
                  <div className="w-4 h-4 bg-orange border border-dark flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-dark" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-blue border-2 border-dark flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-cream" />
              </div>
              <div>
                <div className="label-mono mb-1">Ley 27.506</div>
                <h2 className="font-mono text-xl font-bold">Economía del Conocimiento</h2>
              </div>
            </div>
            <p className="font-sans text-dark/70 mb-4 leading-relaxed">
              Marco legal que promueve actividades de alto valor agregado: software,
              biotech, IA, audiovisual, servicios profesionales de exportación.
              Beneficios fiscales concretos para empresas elegibles.
            </p>
            <ul className="space-y-2">
              {[
                'Reducción 60% impuesto a las ganancias',
                'Bono fiscal 70% contribuciones patronales',
                'Sin retenciones IVA en exportaciones',
                'Aplicable a SAS en DEZ Mendoza',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 font-sans text-sm">
                  <div className="w-4 h-4 bg-blue border border-dark flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-cream" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-dark py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="label-mono text-cream/50 mb-2">El proceso</div>
            <h2 className="font-mono text-3xl md:text-4xl font-bold text-cream">
              Cómo funciona Andén
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-0">
            {[
              {
                step: '01',
                title: 'Diagnóstico',
                desc: '11 preguntas para entender tu empresa y recomendarte la estructura legal ideal.',
                time: '5 min',
              },
              {
                step: '02',
                title: 'Cap table',
                desc: 'Configurás equity, vesting y contribuciones de cada founder.',
                time: '10 min',
              },
              {
                step: '03',
                title: 'Pago único',
                desc: 'USD 500–2.000 todo incluido. Sin sorpresas ni honorarios extra.',
                time: 'Inmediato',
              },
              {
                step: '04',
                title: 'Andén gestiona',
                desc: 'Nuestro equipo lleva adelante todo el proceso legal. Vos seguís el avance en tiempo real.',
                time: '35–50 días',
              },
            ].map((item) => (
              <div key={item.step} className="border-2 border-cream/20 p-6 md:border-r-0 last:border-r-2 hover:border-orange transition-colors">
                <div className="font-mono text-4xl font-bold text-orange/30 mb-3">{item.step}</div>
                <div className="font-mono text-lg font-bold text-cream mb-2">{item.title}</div>
                <p className="font-sans text-sm text-cream/60 leading-relaxed mb-4">{item.desc}</p>
                <div className="tag bg-dark border-cream/20 text-cream/50 text-xs">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="label-mono text-dark/50 mb-2">Precios</div>
          <h2 className="section-title">Un precio. Todo incluido.</h2>
          <p className="font-sans text-dark/60 mt-3">
            Sin honorarios sorpresa. El diagnóstico es gratuito.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="card hover:shadow-[6px_6px_0px_#1A1A2E] transition-shadow">
            <div className="label-mono text-dark/50 mb-2">Startup local · LEC</div>
            <div className="font-mono text-3xl font-bold mb-1">USD 1.500</div>
            <p className="font-sans text-sm text-dark/60 mb-5">
              SAS en DEZ Mendoza + inscripción LEC. Ideal para equipos que facturan en Argentina o LATAM.
            </p>
            <ul className="space-y-2 mb-6">
              {[
                'Constitución SAS en IGJ',
                'Inscripción Zona Franca Digital',
                'Gestión inscripción LEC',
                'Founders Agreement',
                'Todos los documentos legales',
                'Seguimiento en dashboard',
              ].map((i) => (
                <li key={i} className="flex items-center gap-2 font-sans text-sm">
                  <Check className="w-4 h-4 text-orange flex-shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
            <Link href="/onboarding" className="btn-primary w-full text-center block">
              Empezar diagnóstico
            </Link>
          </div>

          <div className="bg-dark text-cream border-2 border-dark shadow-[4px_4px_0px_#F89A2F] p-6 hover:shadow-[6px_6px_0px_#F89A2F] transition-shadow">
            <div className="tag bg-orange text-dark border-orange mb-3 inline-block">
              Inversión global
            </div>
            <div className="label-mono text-cream/50 mb-2">Delaware + SAS · LEC</div>
            <div className="font-mono text-3xl font-bold mb-1">USD 2.000</div>
            <p className="font-sans text-sm text-cream/60 mb-5">
              Estructura dual HoldCo/OpCo para levantar capital de VCs globales. LEC en Argentina.
            </p>
            <ul className="space-y-2 mb-6">
              {[
                'Todo lo del plan anterior',
                'Delaware C-Corp (HoldCo)',
                'Estructura HoldCo / OpCo',
                'Certificate of Incorporation',
                'SAFE template incluido',
                'Intercompany Agreement',
              ].map((i) => (
                <li key={i} className="flex items-center gap-2 font-sans text-sm">
                  <Check className="w-4 h-4 text-orange flex-shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
            <Link href="/onboarding" className="btn-primary w-full text-center block">
              Empezar diagnóstico
            </Link>
          </div>
        </div>

        <p className="text-center font-mono text-sm text-dark/50 mt-6">
          ¿Querés un asesor humano dedicado? <span className="text-dark">+USD 290</span> en cualquier plan.
          <br />
          <span className="text-dark/40">Solo SAS + ZF (sin LEC): USD 500 · Solo LEC: USD 300</span>
        </p>
      </section>

      {/* For who */}
      <section className="border-t-2 border-dark bg-cream py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">¿Para quién es Andén?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Founders pre-revenue',
                desc: 'Tenés una idea o MVP y necesitás la estructura legal correcta desde el arranque. Accedés a la ruta express de LEC (Art. 6°).',
                badge: 'Ruta Express',
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                title: 'Empresas que ya facturan',
                desc: 'Tenés clientes pero operás de forma informal. Formalizás, accedés a beneficios fiscales y podés recibir inversión.',
                badge: 'SAS + LEC',
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Buscás inversión global',
                desc: 'Tenés un term sheet o conversaciones con VCs de EE.UU./Europa. Necesitás una Delaware HoldCo con OpCo en Argentina.',
                badge: 'Delaware + SAS',
              },
            ].map((item) => (
              <div key={item.title} className="card">
                <div className="w-10 h-10 bg-cream border-2 border-dark flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <div className="tag bg-orange text-dark border-orange mb-3 inline-block">
                  {item.badge}
                </div>
                <h3 className="font-mono text-lg font-bold mb-2">{item.title}</h3>
                <p className="font-sans text-sm text-dark/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t-2 border-dark py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-0">
            {[
              {
                q: '¿Andén reemplaza a un abogado?',
                a: 'No. Andén es la interfaz guiada — el proceso legal lo ejecuta nuestro equipo de abogados especializados en sociedades y LEC. Vos ves todo el avance en tu dashboard.',
              },
              {
                q: '¿Qué pasa si mi actividad no califica para la LEC?',
                a: 'El diagnóstico lo detecta automáticamente y te muestra las opciones disponibles: SAS local, Delaware sin LEC, o las alternativas que mejor se adapten a tu caso.',
              },
              {
                q: '¿Puedo tener un co-founder en el exterior?',
                a: 'Sí, aunque hay restricciones para SAS (no puede tener participación de personas jurídicas extranjeras). Si tu co-founder es persona física extranjera, se puede estructurar. Te avisamos durante el diagnóstico.',
              },
              {
                q: '¿Qué incluye "todos los documentos"?',
                a: 'Estatuto SAS, Founders Agreement, IP Assignment (si aplica), Actas de directorio, solicitudes ante MINCYT y Zona Franca, y todos los comprobantes del proceso.',
              },
              {
                q: '¿Puedo empezar aunque no tenga el nombre de la empresa definido?',
                a: 'Sí. El diagnóstico y cap table se pueden completar sin nombre. Solo necesitás el nombre antes de la presentación ante IGJ, que es uno de los primeros pasos del proceso.',
              },
            ].map((item, i) => (
              <details key={i} className="border-b-2 border-dark group">
                <summary className="flex items-center justify-between py-5 cursor-pointer list-none font-mono font-bold hover:text-orange transition-colors">
                  {item.q}
                  <ChevronRight className="w-4 h-4 flex-shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="pb-5 font-sans text-dark/70 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-dark py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="font-mono text-sm text-orange mb-4 uppercase tracking-wider">
            Empezá gratis
          </div>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-cream mb-4">
            Tu empresa, lista para operar<br />en 35 días.
          </h2>
          <p className="font-sans text-cream/60 mb-8">
            Diagnóstico gratuito. Pagás solo si avanzás.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding" className="btn-primary">
              Iniciá tu empresa <ArrowRight className="inline ml-2 w-4 h-4" />
            </Link>
            <Link href="/onboarding/existente" className="btn-secondary">
              Ya tengo empresa
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-dark bg-cream">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono font-bold text-lg">
            ANDÉN<span className="text-orange">.</span>
          </div>
          <div className="font-mono text-xs text-dark/40 text-center">
            Andén no es un estudio jurídico. Los servicios legales son provistos por abogados matriculados asociados.
          </div>
          <a href="mailto:hello@anden.tech" className="font-mono text-sm hover:text-orange transition-colors">
            hello@anden.tech
          </a>
        </div>
      </footer>
    </div>
  )
}
