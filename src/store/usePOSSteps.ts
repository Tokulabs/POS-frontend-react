import { create } from 'zustand'

interface IPOSStepStore {
  currentStep: number
  updateCurrentStep: (step: number) => void
}

export const usePOSStep = create<IPOSStepStore>((set) => ({
  currentStep: 0,
  updateCurrentStep: (step) => {
    set({
      currentStep: step,
    })
  },
}))
