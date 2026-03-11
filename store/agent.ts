'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  AgentState,
  AgentTier,
  AgentFunction,
  AgentAsset,
  AgentVolume,
  AgentAutonomy,
  AgentSupervision,
  CompanyStatus,
  AgentScope,
  BeneficiaryType,
  initialAgentState,
} from '@/types/agent'

function computeTier(fn?: AgentFunction, vol?: AgentVolume): AgentTier {
  const highRisk = fn === 'trading' || fn === 'defi' || fn === 'tesoreria'
  const medHighRisk = fn === 'general_fondos' || highRisk

  if (vol === 'mas_1m') return 'enterprise'
  if (highRisk) return 'professional'
  if (medHighRisk && vol === '100k_1m') return 'professional'
  if (vol === '100k_1m') return 'professional'
  if (vol === '10k_100k' && medHighRisk) return 'professional'
  return 'starter'
}

interface AgentStore extends AgentState {
  setAgentFunction: (v: AgentFunction) => void
  toggleAsset: (v: AgentAsset) => void
  setAgentVolume: (v: AgentVolume) => void
  setAgentAutonomy: (v: AgentAutonomy) => void
  setAgentSupervision: (v: AgentSupervision) => void
  setHasCompany: (v: CompanyStatus) => void
  setAgentScope: (v: AgentScope) => void
  setLimitPerTx: (v: number) => void
  setLimitDaily: (v: number) => void
  setLimitMonthly: (v: number) => void
  setAllowedAssets: (v: AgentAsset[]) => void
  setProhibitedAssets: (v: string) => void
  toggleOverrideCondition: (v: string) => void
  setOverrideDropPct: (v: number) => void
  setOverrideTxThreshold: (v: number) => void
  setBeneficiaryType: (v: BeneficiaryType) => void
  setBeneficiaryDetails: (v: string) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      ...initialAgentState,

      setAgentFunction: (agent_function) => {
        set({ agent_function })
        set({ tier: computeTier(agent_function, get().agent_volume) })
      },
      toggleAsset: (asset) => {
        const current = get().agent_assets
        const next = current.includes(asset)
          ? current.filter((a) => a !== asset)
          : [...current, asset]
        set({ agent_assets: next })
      },
      setAgentVolume: (agent_volume) => {
        set({ agent_volume })
        set({ tier: computeTier(get().agent_function, agent_volume) })
      },
      setAgentAutonomy: (agent_autonomy) => set({ agent_autonomy }),
      setAgentSupervision: (agent_supervision) => set({ agent_supervision }),
      setHasCompany: (has_company) => set({ has_company }),
      setAgentScope: (agent_scope) => set({ agent_scope }),

      setLimitPerTx: (limit_per_tx) => set({ limit_per_tx }),
      setLimitDaily: (limit_daily) => set({ limit_daily }),
      setLimitMonthly: (limit_monthly) => set({ limit_monthly }),
      setAllowedAssets: (allowed_assets) => set({ allowed_assets }),
      setProhibitedAssets: (prohibited_assets) => set({ prohibited_assets }),
      toggleOverrideCondition: (cond) => {
        const current = get().override_conditions
        const next = current.includes(cond)
          ? current.filter((c) => c !== cond)
          : [...current, cond]
        set({ override_conditions: next })
      },
      setOverrideDropPct: (override_drop_pct) => set({ override_drop_pct }),
      setOverrideTxThreshold: (override_tx_threshold) => set({ override_tx_threshold }),
      setBeneficiaryType: (beneficiary_type) => set({ beneficiary_type }),
      setBeneficiaryDetails: (beneficiary_details) => set({ beneficiary_details }),

      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
      reset: () => set(initialAgentState),
    }),
    { name: 'anden-agent' }
  )
)
