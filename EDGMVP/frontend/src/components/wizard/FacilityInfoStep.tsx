import { Building2 } from "lucide-react";
import { useQuestionnaireStore } from "../../stores/questionnaireStore";
import { Input } from "../ui/input";
import { FormField } from "./FormField";

export function FacilityInfoStep() {
  const facility = useQuestionnaireStore((state) => state.form.facility);
  const updateFacility = useQuestionnaireStore((state) => state.updateFacility);

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Facility Info</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Facility Name" htmlFor="facility-name">
          <Input
            id="facility-name"
            value={facility.name}
            onChange={(event) => updateFacility({ name: event.target.value })}
            placeholder="Acme Foods Plant 1"
          />
        </FormField>
        <FormField label="SQF Category" htmlFor="sqf-category">
          <select
            id="sqf-category"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 transition focus:ring-2"
            value={facility.sqfCategory}
            onChange={(event) => updateFacility({ sqfCategory: event.target.value })}
          >
            <option value="food_manufacturing">Food Manufacturing</option>
            <option value="primary_production">Primary Production</option>
            <option value="storage_distribution">Storage and Distribution</option>
            <option value="food_packaging">Food Packaging</option>
            <option value="quality_code">Quality Code</option>
            <option value="other">Other</option>
          </select>
        </FormField>
        <FormField label="Address" htmlFor="facility-address">
          <Input
            id="facility-address"
            value={facility.address}
            onChange={(event) => updateFacility({ address: event.target.value })}
            placeholder="123 Quality Way, Denver, CO"
          />
        </FormField>
        <FormField label="Contact Email" htmlFor="contact-email">
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
