export type AgentFunction =
  | 'trading'
  | 'defi'
  | 'pagos'
  | 'tesoreria'
  | 'marketplace'
  | 'claims'
  | 'general_fondos'
  | 'otro'

export type AgentAsset =
  | 'crypto'
  | 'stablecoins'
  | 'defi_tokens'
  | 'rwa'
  | 'fiat'
  | 'datos_apis'
  | 'no_activos'

export type AgentVolume = 'menos_10k' | '10k_100k' | '100k_1m' | 'mas_1m' | 'no_se'

export type AgentAutonomy = 'rule_based' | 'ia_fijo' | 'ia_adaptable' | 'autonomo_total'

export type AgentSupervision = 'revision_previa' | 'revision_periodica' | 'excepcion' | 'autonomo'

export type CompanyStatus = 'sas_sa' | 'delaware' | 'no_empresa'

export type AgentScope =
  | 'argentina_local'
  | 'argentina_global'
  | 'onchain'
  | 'mixto'

export type AgentTier = 'starter' | 'professional' | 'enterprise'

export type BeneficiaryType = 'empresa' | 'empresa_inversores' | 'holders_tokens' | 'a_definir'

export const TIER_PRICES: Record<AgentTier, { setup: number; monthly: number; monthlyPct?: number }> = {
  starter: { setup: 500, monthly: 99 },
  professional: { setup: 2500, monthly: 499, monthlyPct: 0.1 },
  enterprise: { setup: 10000, monthly: 1999, monthlyPct: 0.05 },
}

export const TIER_LABELS: Record<AgentTier, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

export const TIER_DESC: Record<AgentTier, string> = {
  starter: 'Trading bots simples, agentes de optimización',
  professional: 'DeFi agents, marketplaces, gestores algorítmicos',
  enterprise: 'DAOs, fondos tokenizados, tesorerías autónomas',
}

export interface AgentState {
  // Diagnostic
  agent_function?: AgentFunction
  agent_assets: AgentAsset[]
  agent_volume?: AgentVolume
  agent_autonomy?: AgentAutonomy
  agent_supervision?: AgentSupervision
  has_company?: CompanyStatus
  agent_scope?: AgentScope

  // Computed
  tier: AgentTier
  scenario: 1 | 2
  is_founding_member: boolean

  // Parameters
  limit_per_tx?: number
  limit_daily?: number
  limit_monthly?: number
  allowed_assets: AgentAsset[]
  prohibited_assets: string
  override_conditions: string[]
  override_drop_pct?: number
  override_tx_threshold?: number
  beneficiary_type?: BeneficiaryType
  beneficiary_details: string

  // Meta
  currentStep: number
}

export const initialAgentState: AgentState = {
  agent_assets: [],
  tier: 'professional',
  scenario: 2,
  is_founding_member: true,
  allowed_assets: [],
  prohibited_assets: '',
  override_conditions: [],
  beneficiary_details: '',
  currentStep: 0,
}
