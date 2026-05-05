import { create } from "zustand";
import type {
  FacilityInfo,
  HaccpDetails,
  InfrastructureDetails,
  QuestionnaireForm
} from "../types/questionnaire";

const initialForm: QuestionnaireForm = {
  facility: {
    name: "",
    sqfCategory: "food_manufacturing",
    address: "",
    contactEmail: ""
  },
  haccp: {
    productTypes: [],
    processFlow: "",
    hazards: []
  },
  infrastructure: {
    buildingControls: "",
    sanitationProgram: "",
    allergenControls: ""
  }
};

interface QuestionnaireStore {
  form: QuestionnaireForm;
  updateFacility: (facility: Partial<FacilityInfo>) => void;
  updateHaccp: (haccp: Partial<HaccpDetails>) => void;
  updateInfrastructure: (infrastructure: Partial<InfrastructureDetails>) => void;
  reset: () => void;
}

export const useQuestionnaireStore = create<QuestionnaireStore>((set) => ({
  form: initialForm,
  updateFacility: (facility) =>
    set((state) => ({ form: { ...state.form, facility: { ...state.form.facility, ...facility } } })),
  updateHaccp: (haccp) =>
    set((state) => ({ form: { ...state.form, haccp: { ...state.form.haccp, ...haccp } } })),
  updateInfrastructure: (infrastructure) =>
    set((state) => ({
      form: {
        ...state.form,
        infrastructure: { ...state.form.infrastructure, ...infrastructure }
      }
    })),
  reset: () => set({ form: initialForm })
}));
