export type ActivityType =
  | 'software_saas_ia'
  | 'crypto_web3_defi'
  | 'produccion_audiovisual'
  | 'biotecnologia'
  | 'servicios_profesionales'
  | 'industria_4'
  | 'nanotecnologia'
  | 'otra'

export type RevenuePercentage = '70_plus' | '40_70' | 'menos_40' | 'sin_facturacion'

export type FoundersCount = 'solo_yo' | 'dos' | 'tres_plus'

export type TeamLocation = 'todos_argentina' | 'cofunder_exterior' | 'todos_exterior'

export type Stage = 'idea' | 'mvp' | 'primeros_clientes' | 'creciendo'

export type Market = 'argentina' | 'latam' | 'eeuu_europa' | 'global'

export type InvestmentPlan =
  | 'no_por_ahora'
  | 'angels_familia'
  | 'vcs_locales'
  | 'vcs_globales'
  | 'term_sheet'

export type Currency = 'ars' | 'usd' | 'crypto' | 'mixto'

export type EmployeePlan = 'solo_fundadores' | '1_3_pronto' | 'mas_de_3'

export type PreExistingIP = 'no' | 'codigo' | 'marca_dominio' | 'varias'

export type CompanyNameStatus = 'si_chequeado' | 'si_no_chequeado' | 'todavia_no'

export type OnboardingCase = 'CASO_1' | 'CASO_2' | 'CASO_3' | 'CASO_4'

export type LECStatus = 'eligible' | 'ruta_express' | 'no_lec'

export type AdvisorMode = 'ai' | 'solo' | 'asesor'

export interface CapTableMember {
  id: string
  nombre: string
  rol: 'Founder' | 'Co-founder' | 'CTO' | 'Advisor' | 'Inversor' | 'Empleado clave'
  equity: number
  contribucion: 'Sweat equity' | 'Capital en efectivo' | 'IP' | 'Mixto'
  vesting: '4y_1c' | '3y_6m' | 'sin_vesting' | 'a_definir'
  montoCapital?: number
}

export interface OnboardingState {
  // Mode
  mode: 'new' | 'existing'

  // Block A
  actividad?: ActivityType
  porcentajeFacturacion?: RevenuePercentage

  // Block B
  cantidadFounders?: FoundersCount
  ubicacionEquipo?: TeamLocation
  etapa?: Stage

  // Block C
  mercado?: Market
  inversion?: InvestmentPlan
  moneda?: Currency

  // Block D
  empleados?: EmployeePlan
  ipPreexistente?: PreExistingIP
  nombreEmpresa?: CompanyNameStatus

  // Computed flags
  lecStatus?: LECStatus
  casoRecomendado?: OnboardingCase
  ipAssignmentRequired?: boolean
  cofounderExterior?: boolean

  // Existing company fields
  formaLegal?: string
  afipAlDia?: string

  // Cap table
  capTable: CapTableMember[]

  // Structure selection
  structureSelected?: OnboardingCase
  advisorMode?: AdvisorMode

  // Meta
  currentStep: number
  totalSteps: number
  completedAt?: string
}

export const initialOnboardingState: OnboardingState = {
  mode: 'new',
  capTable: [],
  currentStep: 0,
  totalSteps: 11,
}
