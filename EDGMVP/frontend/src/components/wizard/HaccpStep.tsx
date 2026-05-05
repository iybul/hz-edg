import { ClipboardCheck } from "lucide-react";
import { useQuestionnaireStore } from "../../stores/questionnaireStore";
import { Input, Textarea } from "../ui/input";
import { FormField } from "./FormField";

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
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">HACCP/Product Details</h2>
      </div>
      <FormField
        label="Product Types"
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
      <FormField label="Process Flow" htmlFor="process-flow">
        <Textarea
          id="process-flow"
          value={haccp.processFlow}
          onChange={(event) => updateHaccp({ processFlow: event.target.value })}
          placeholder="Receiving > storage > preparation > packaging > finished goods hold > distribution"
        />
      </FormField>
      <FormField
        label="Known Hazards"
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
