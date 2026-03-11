'use client'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-xs text-dark/50 uppercase tracking-wider">{label}</span>
          <span className="font-mono text-xs text-dark/50">{current}/{total}</span>
        </div>
      )}
      <div className="h-2 bg-dark/10 border border-dark/20 w-full">
        <div
          className="h-full bg-orange transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
