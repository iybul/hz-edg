import { ClipboardCheck } from "lucide-react";
import { useQuestionnaireStore } from "../../stores/questionnaireStore";
import { Input, Textarea } from "../ui/input";
import { FormField } from "./FormField";
import { StepHeader } from "./StepHeader";

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function HaccpStep() {
  const haccp = useQuestionnaireStore((state) => state.form.haccp);
  const updateHaccp = useQuestionnaireStore((state) => state.updateHaccp);

  return (
    <section className="space-y-8">
      <StepHeader
        step="02"
        title="HACCP & product details"
        description="Describe the process flow and known hazards we should plan for."
        icon={<ClipboardCheck className="h-4 w-4" />}
      />
      <FormField
        label="Product types"
        htmlFor="product-types"
        hint="Separate multiple products with commas."
      >
        <Input
          id="product-types"
          value={haccp.productTypes.join(", ")}
          onChange={(event) => updateHaccp({ productTypes: parseList(event.target.value) })}
          placeholder="Ready-to-eat salads, fresh-cut fruit"
        />
      </FormField>
      <FormField label="Process flow" htmlFor="process-flow">
        <Textarea
          id="process-flow"
          value={haccp.processFlow}
          onChange={(event) => updateHaccp({ processFlow: event.target.value })}
          placeholder="Receiving > storage > preparation > packaging > finished goods hold > distribution"
        />
      </FormField>
      <FormField
        label="Known hazards"
        htmlFor="hazards"
        hint="Separate biological, chemical, and physical hazards with commas."
      >
        <Input
          id="hazards"
          value={haccp.hazards.join(", ")}
          onChange={(event) => updateHaccp({ hazards: parseList(event.target.value) })}
          placeholder="Listeria monocytogenes, allergens, metal fragments"
        />
      </FormField>
    </section>
  );
}
