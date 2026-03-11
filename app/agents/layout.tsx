import Link from 'next/link'

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-agent-dark bg-agent-grid text-cream">
      <nav className="border-b border-cyan/10 bg-agent-dark/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/agents" className="font-mono font-bold text-lg tracking-tight">
            ANDÉN<span className="text-cyan">.</span>
            <span className="text-cyan/50 text-sm ml-2">AGENTS</span>
          </Link>
          <Link
            href="/"
            style={{ fontFamily: 'Courier New, monospace' }}
            className="text-xs text-cream/30 hover:text-cream/60 transition-colors"
          >
            ← Constituí tu empresa
          </Link>
        </div>
      </nav>
      {children}
    </div>
  )
}
