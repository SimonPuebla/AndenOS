'use client'

import { useOnboardingStore } from '@/store/onboarding'

const actividadLabels: Record<string, string> = {
  software_saas_ia: 'Software / SaaS / IA',
  crypto_web3_defi: 'Crypto / Web3 / DeFi',
  produccion_audiovisual: 'Producción audiovisual',
  biotecnologia: 'Biotecnología',
  servicios_profesionales: 'Servicios profesionales',
  industria_4: 'Industria 4.0 / IoT',
  nanotecnologia: 'Nanotecnología / Aeroespacial',
  otra: 'Otra actividad',
}

const etapaLabels: Record<string, string> = {
  idea: 'Idea / Pre-producto',
  mvp: 'MVP en desarrollo',
  primeros_clientes: 'Primeros clientes',
  creciendo: 'Creciendo / Buscando inversión',
}

const mercadoLabels: Record<string, string> = {
  argentina: 'Argentina',
  latam: 'LATAM',
  eeuu_europa: 'EE.UU. / Europa',
  global: 'Global',
}

const casoLabels: Record<string, { label: string; color: string }> = {
  CASO_1: { label: 'Sin LEC', color: 'text-dark' },
  CASO_2: { label: 'Empresa existente', color: 'text-blue' },
  CASO_3: { label: 'SAS + LEC', color: 'text-orange' },
  CASO_4: { label: 'Delaware + SAS + LEC', color: 'text-orange' },
}

const lecLabels: Record<string, string> = {
  eligible: 'Elegible LEC',
  ruta_express: 'Ruta Express LEC',
  no_lec: 'Sin elegibilidad LEC',
}

export function ProfileSidebar() {
  const state = useOnboardingStore()

  const fields = [
    state.actividad && {
      label: 'Actividad',
      value: actividadLabels[state.actividad] || state.actividad,
    },
    state.etapa && { label: 'Etapa', value: etapaLabels[state.etapa] || state.etapa },
    state.mercado && { label: 'Mercado', value: mercadoLabels[state.mercado] || state.mercado },
    state.cantidadFounders && {
      label: 'Founders',
      value:
        state.cantidadFounders === 'solo_yo'
          ? 'Solo yo'
          : state.cantidadFounders === 'dos'
          ? '2 founders'
          : '3 o más founders',
    },
    state.inversion && {
      label: 'Inversión',
      value:
        state.inversion === 'no_por_ahora'
          ? 'No por ahora'
          : state.inversion === 'angels_familia'
          ? 'Angels / Familia'
          : state.inversion === 'vcs_locales'
          ? 'VCs locales'
          : state.inversion === 'vcs_globales'
          ? 'VCs globales'
          : 'Ya tiene term sheet',
    },
  ].filter(Boolean) as { label: string; value: string }[]

  const caso = state.casoRecomendado
  const lec = state.lecStatus

  return (
    <div className="sticky top-24 space-y-4">
      <div className="card">
        <div className="label-mono text-dark/50 mb-4">Tu perfil</div>

        {fields.length === 0 ? (
          <p className="font-sans text-sm text-dark/40">
            Completá las preguntas para ver tu perfil aquí.
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.label}>
                <div className="font-mono text-xs text-dark/40 uppercase tracking-wider">{f.label}</div>
                <div className="font-sans text-sm font-medium text-dark mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>
        )}

        {(caso || lec) && (
          <div className="mt-4 pt-4 border-t border-dark/10 space-y-2">
            {caso && (
              <div>
                <div className="font-mono text-xs text-dark/40 uppercase tracking-wider">Caso recomendado</div>
                <div className={`font-mono text-sm font-bold mt-0.5 ${casoLabels[caso]?.color || 'text-dark'}`}>
                  {casoLabels[caso]?.label}
                </div>
              </div>
            )}
            {lec && (
              <div>
                <div className="font-mono text-xs text-dark/40 uppercase tracking-wider">LEC</div>
                <div className="font-sans text-sm text-dark mt-0.5">{lecLabels[lec]}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {state.cofounderExterior && (
        <div className="border-2 border-orange bg-orange/10 p-4">
          <div className="font-mono text-xs font-bold text-dark mb-1">AVISO</div>
          <p className="font-sans text-xs text-dark/70">
            Las SAS tienen restricciones para co-founders en el exterior. Lo analizamos en detalle.
          </p>
        </div>
      )}

      {state.ipAssignmentRequired && (
        <div className="border-2 border-blue bg-blue/5 p-4">
          <div className="font-mono text-xs font-bold text-blue mb-1">IP ASSIGNMENT</div>
          <p className="font-sans text-xs text-dark/70">
            Hay activos pre-existentes que requieren un IP Assignment Agreement.
          </p>
        </div>
      )}
    </div>
  )
}
