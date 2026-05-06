import { Factory } from "lucide-react";
import { useQuestionnaireStore } from "../../stores/questionnaireStore";
import { Textarea } from "../ui/input";
import { FormField } from "./FormField";
import { StepHeader } from "./StepHeader";

export function InfrastructureStep() {
  const infrastructure = useQuestionnaireStore((state) => state.form.infrastructure);
  const updateInfrastructure = useQuestionnaireStore(
    (state) => state.updateInfrastructure
  );

  return (
    <section className="space-y-8">
      <StepHeader
        step="03"
        title="Infrastructure"
        description="Document the building, sanitation, and allergen controls in place."
        icon={<Factory className="h-4 w-4" />}
      />
      <FormField label="Building controls" htmlFor="building-controls">
        <Textarea
          id="building-controls"
          value={infrastructure.buildingControls}
          onChange={(event) =>
            updateInfrastructure({ buildingControls: event.target.value })
          }
          placeholder="Describe zoning, pest exclusion, drainage, lighting, and maintenance controls."
        />
      </FormField>
      <FormField label="Sanitation program" htmlFor="sanitation-program">
        <Textarea
          id="sanitation-program"
          value={infrastructure.sanitationProgram}
          onChange={(event) =>
            updateInfrastructure({ sanitationProgram: event.target.value })
          }
          placeholder="Describe SSOPs, master sanitation schedule, chemical controls, and verification."
        />
      </FormField>
      <FormField label="Allergen controls" htmlFor="allergen-controls">
        <Textarea
          id="allergen-controls"
          value={infrastructure.allergenControls}
          onChange={(event) =>
            updateInfrastructure({ allergenControls: event.target.value })
          }
          placeholder="Describe allergen storage, scheduling, label review, and changeover validation."
        />
      </FormField>
    </section>
  );
}
