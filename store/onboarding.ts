'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  OnboardingState,
  initialOnboardingState,
  ActivityType,
  RevenuePercentage,
  FoundersCount,
  TeamLocation,
  Stage,
  Market,
  InvestmentPlan,
  Currency,
  EmployeePlan,
  PreExistingIP,
  CompanyNameStatus,
  OnboardingCase,
  LECStatus,
  AdvisorMode,
  CapTableMember,
} from '@/types/onboarding'

const LEC_ACTIVITIES: ActivityType[] = [
  'software_saas_ia',
  'crypto_web3_defi',
  'produccion_audiovisual',
  'biotecnologia',
  'servicios_profesionales',
  'industria_4',
  'nanotecnologia',
]

function computeCase(state: Partial<OnboardingState>): {
  casoRecomendado: OnboardingCase
  lecStatus: LECStatus
} {
  const { actividad, porcentajeFacturacion, etapa, inversion, ubicacionEquipo } = state

  const isLECActivity = actividad && LEC_ACTIVITIES.includes(actividad)

  // No LEC flags
  if (!isLECActivity) {
    return { casoRecomendado: 'CASO_1', lecStatus: 'no_lec' }
  }

  if (porcentajeFacturacion === 'menos_40') {
    return { casoRecomendado: 'CASO_1', lecStatus: 'no_lec' }
  }

  // Force CASO_4 if VCs globales or term sheet
  if (inversion === 'vcs_globales' || inversion === 'term_sheet') {
    return { casoRecomendado: 'CASO_4', lecStatus: 'eligible' }
  }

  // Ruta express: LEC activity, no revenue, early stage
  if (
    (porcentajeFacturacion === 'sin_facturacion' || !porcentajeFacturacion) &&
    (etapa === 'idea' || etapa === 'mvp')
  ) {
    return { casoRecomendado: 'CASO_3', lecStatus: 'ruta_express' }
  }

  // LEC con capital (looking for investment)
  if (
    inversion === 'vcs_locales' ||
    inversion === 'angels_familia'
  ) {
    return { casoRecomendado: 'CASO_4', lecStatus: 'eligible' }
  }

  return { casoRecomendado: 'CASO_3', lecStatus: 'eligible' }
}

interface OnboardingStore extends OnboardingState {
  setMode: (mode: 'new' | 'existing') => void
  setActividad: (v: ActivityType) => void
  setPorcentajeFacturacion: (v: RevenuePercentage) => void
  setCantidadFounders: (v: FoundersCount) => void
  setUbicacionEquipo: (v: TeamLocation) => void
  setEtapa: (v: Stage) => void
  setMercado: (v: Market) => void
  setInversion: (v: InvestmentPlan) => void
  setMoneda: (v: Currency) => void
  setEmpleados: (v: EmployeePlan) => void
  setIpPreexistente: (v: PreExistingIP) => void
  setNombreEmpresa: (v: CompanyNameStatus) => void
  setCapTable: (members: CapTableMember[]) => void
  setStructureSelected: (caso: OnboardingCase) => void
  setAdvisorMode: (mode: AdvisorMode) => void
  setFormaLegal: (v: string) => void
  setAfipAlDia: (v: string) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
  recompute: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialOnboardingState,

      setMode: (mode) => set({ mode }),
      setActividad: (actividad) => {
        set({ actividad })
        get().recompute()
      },
      setPorcentajeFacturacion: (porcentajeFacturacion) => {
        set({ porcentajeFacturacion })
        get().recompute()
      },
      setCantidadFounders: (cantidadFounders) => set({ cantidadFounders }),
      setUbicacionEquipo: (ubicacionEquipo) => {
        set({
          ubicacionEquipo,
          cofounderExterior: ubicacionEquipo === 'cofunder_exterior',
        })
      },
      setEtapa: (etapa) => {
        set({ etapa })
        get().recompute()
      },
      setMercado: (mercado) => set({ mercado }),
      setInversion: (inversion) => {
        set({ inversion })
        get().recompute()
      },
      setMoneda: (moneda) => set({ moneda }),
      setEmpleados: (empleados) => set({ empleados }),
      setIpPreexistente: (ipPreexistente) => {
        set({
          ipPreexistente,
          ipAssignmentRequired: ipPreexistente !== 'no',
        })
      },
      setNombreEmpresa: (nombreEmpresa) => set({ nombreEmpresa }),
      setCapTable: (capTable) => set({ capTable }),
      setStructureSelected: (structureSelected) => set({ structureSelected }),
      setAdvisorMode: (advisorMode) => set({ advisorMode }),
      setFormaLegal: (formaLegal) => set({ formaLegal }),
      setAfipAlDia: (afipAlDia) => set({ afipAlDia }),

      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      reset: () => set(initialOnboardingState),

      recompute: () => {
        const state = get()
        const { casoRecomendado, lecStatus } = computeCase(state)
        set({ casoRecomendado, lecStatus })
      },
    }),
    {
      name: 'anden-onboarding',
    }
  )
)
