import { Factory } from "lucide-react";
import { useQuestionnaireStore } from "../../stores/questionnaireStore";
import { Textarea } from "../ui/input";
import { FormField } from "./FormField";

export function InfrastructureStep() {
  const infrastructure = useQuestionnaireStore((state) => state.form.infrastructure);
  const updateInfrastructure = useQuestionnaireStore((state) => state.updateInfrastructure);

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <Factory className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Infrastructure</h2>
      </div>
      <FormField label="Building Controls" htmlFor="building-controls">
        <Textarea
          id="building-controls"
          value={infrastructure.buildingControls}
          onChange={(event) => updateInfrastructure({ buildingControls: event.target.value })}
          placeholder="Describe zoning, pest exclusion, drainage, lighting, and maintenance controls."
        />
      </FormField>
      <FormField label="Sanitation Program" htmlFor="sanitation-program">
        <Textarea
          id="sanitation-program"
          value={infrastructure.sanitationProgram}
          onChange={(event) => updateInfrastructure({ sanitationProgram: event.target.value })}
          placeholder="Describe SSOPs, master sanitation schedule, chemical controls, and verification."
        />
      </FormField>
      <FormField label="Allergen Controls" htmlFor="allergen-controls">
        <Textarea
          id="allergen-controls"
          value={infrastructure.allergenControls}
          onChange={(event) => updateInfrastructure({ allergenControls: event.target.value })}
          placeholder="Describe allergen storage, scheduling, label review, and changeover validation."
        />
      </FormField>
    </section>
  );
}
