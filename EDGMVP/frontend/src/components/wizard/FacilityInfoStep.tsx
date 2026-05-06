import { Building2 } from "lucide-react";
import { useQuestionnaireStore } from "../../stores/questionnaireStore";
import { Input, Select } from "../ui/input";
import { FormField } from "./FormField";
import { StepHeader } from "./StepHeader";

export function FacilityInfoStep() {
  const facility = useQuestionnaireStore((state) => state.form.facility);
  const updateFacility = useQuestionnaireStore((state) => state.updateFacility);

  return (
    <section className="space-y-8">
      <StepHeader
        step="01"
        title="Facility info"
        description="Tell us about the operating site this manual covers."
        icon={<Building2 className="h-4 w-4" />}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Facility name" htmlFor="facility-name">
          <Input
            id="facility-name"
            value={facility.name}
            onChange={(event) => updateFacility({ name: event.target.value })}
            placeholder="Acme Foods Plant 1"
          />
        </FormField>
        <FormField label="SQF category" htmlFor="sqf-category">
          <Select
            id="sqf-category"
            value={facility.sqfCategory}
            onChange={(event) => updateFacility({ sqfCategory: event.target.value })}
          >
            <option value="food_manufacturing">Food Manufacturing</option>
            <option value="primary_production">Primary Production</option>
            <option value="storage_distribution">Storage and Distribution</option>
            <option value="food_packaging">Food Packaging</option>
            <option value="quality_code">Quality Code</option>
            <option value="other">Other</option>
          </Select>
        </FormField>
        <FormField label="Address" htmlFor="facility-address">
          <Input
            id="facility-address"
            value={facility.address}
            onChange={(event) => updateFacility({ address: event.target.value })}
            placeholder="123 Quality Way, Denver, CO"
          />
        </FormField>
        <FormField label="Contact email" htmlFor="contact-email">
          <Input
            id="contact-email"
            type="email"
            value={facility.contactEmail}
            onChange={(event) => updateFacility({ contactEmail: event.target.value })}
            placeholder="qa@example.com"
          />
        </FormField>
      </div>
    </section>
  );
}
