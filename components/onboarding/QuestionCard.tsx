'use client'

import { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

interface Option {
  value: string
  label: string
  desc?: string
  badge?: string
}

interface QuestionCardProps {
  stepNumber: number
  block: string
  question: string
  subtitle?: string
  options: Option[]
  selected?: string
  onSelect: (value: string) => void
  onBack?: () => void
  warning?: ReactNode
}

export function QuestionCard({
  stepNumber,
  block,
  question,
  subtitle,
  options,
  selected,
  onSelect,
  onBack,
  warning,
}: QuestionCardProps) {
  return (
    <div className="max-w-xl w-full">
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 border-2 border-dark flex items-center justify-center hover:bg-dark hover:text-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <div className="font-mono text-xs text-dark/40 uppercase tracking-wider">{block}</div>
          <div className="font-mono text-xs text-orange">Pregunta {stepNumber}</div>
        </div>
      </div>

      <h2 className="font-mono text-xl md:text-2xl font-bold text-dark mb-2 leading-tight">
        {question}
      </h2>
      {subtitle && (
        <p className="font-sans text-sm text-dark/60 mb-6">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-6" />}

      {warning && <div className="mb-4">{warning}</div>}

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`w-full text-left p-4 border-2 transition-all duration-100 ${
              selected === opt.value
                ? 'border-orange bg-orange/10 shadow-[2px_2px_0px_#F89A2F]'
                : 'border-dark bg-cream hover:border-orange hover:bg-orange/5 shadow-[2px_2px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_#F89A2F]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-4 h-4 border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                    selected === opt.value ? 'border-orange bg-orange' : 'border-dark'
                  }`}
                >
                  {selected === opt.value && (
                    <div className="w-2 h-2 bg-dark" />
                  )}
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-dark">{opt.label}</div>
                  {opt.desc && (
                    <div className="font-sans text-xs text-dark/60 mt-1">{opt.desc}</div>
                  )}
                </div>
              </div>
              {opt.badge && (
                <div className="tag bg-orange text-dark border-orange text-xs flex-shrink-0">
                  {opt.badge}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
