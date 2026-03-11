'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react'

const PROBLEMS = [
  'Los agentes de IA no tienen personalidad jurídica',
  'No pueden ser titulares de activos',
  'No pueden firmar contratos',
  'Quien los despliega asume toda la responsabilidad sin estructura',
]

const SOLUTIONS = [
  'Smart Fiduciae: fideicomiso argentino con administración algorítmica',
  'Patrimonio separado (Art. 1682 CCyC) — aislado del riesgo del desarrollador',
  'Andén actúa como fiduciario — titularidad legal y supervisión',
  'El agente opera dentro del patrimonio con parámetros definidos',
]

export default function AgentsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      {/* Badge */}
      <div className="flex justify-center mb-10">
        <span className="agent-badge tracking-[0.2em]">
          PRIMERA JURISDICCIÓN DEL MUNDO PARA AGENTES DE IA
        </span>
      </div>

      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="font-mono text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-cream leading-[1.15] mb-8">
          Tu agente necesita un lugar<br className="hidden md:block" /> donde operar legalmente.
        </h1>
        <p className="font-sans text-cream/50 text-lg max-w-2xl mx-auto leading-relaxed">
          Los agentes de IA ya mueven dinero, ejecutan contratos y toman decisiones autónomas
          — pero operan en un vacío legal. Mendoza es la primera jurisdicción del mundo que
          les da un marco: patrimonio separado, responsabilidad delimitada, cobertura jurídica real.
        </p>
      </div>

      {/* Problem / Solution */}
      <div className="grid md:grid-cols-2 gap-4 mb-16 mt-14">
        <div className="agent-card">
          <div className="agent-label mb-4 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-orange" />
            El problema
          </div>
          <ul className="space-y-3">
            {PROBLEMS.map((p) => (
              <li key={p} className="flex items-start gap-3 font-sans text-sm text-cream/60">
                <span className="text-orange mt-0.5 flex-shrink-0">✗</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="agent-card border-cyan/40">
          <div className="agent-label mb-4 flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-cyan" />
            La solución Andén
          </div>
          <ul className="space-y-3">
            {SOLUTIONS.map((s) => (
              <li key={s} className="flex items-start gap-3 font-sans text-sm text-cream/70">
                <span className="text-cyan mt-0.5 flex-shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <Link href="/agents/onboarding" className="agent-btn text-lg px-8 py-4 inline-flex items-center gap-2">
          Registrá tu agente <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="block">
          <Link href="/" style={{ fontFamily: 'Courier New, monospace' }} className="text-xs text-[#6B6B8A] hover:text-cream/50 transition-colors">
            ¿Todavía no tenés empresa? Primero constituila acá →
          </Link>
        </div>
      </div>

      {/* Founding member note */}
      <div className="mt-20 border border-cyan/10 p-6 text-center">
        <div className="font-mono text-xs text-cyan mb-2">⭐ FOUNDING MEMBER · ZONA DIGITAL MENDOZA</div>
        <p className="font-sans text-sm text-cream/40 max-w-xl mx-auto">
          Registrarte ahora te da acceso prioritario al Escenario 2 (Q3 2026), precio bloqueado,
          y participación en el diseño del sandbox regulatorio.
        </p>
      </div>
    </div>
  )
}
