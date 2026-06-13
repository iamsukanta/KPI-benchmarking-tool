"use client";

import FacilityDetailCreateForm from "@/app/(dashboard)/facilities/[facilityId]/detail/create/form";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { facilityDetailSchema, FacilityDetailFormData } from "@/lib/validators/facility";
import { updateFacilityYearlyData } from "@/lib/api/facilities";
import { FacilityDetail } from "@/lib/types/facilities";

type Props = {
  facilityId: number;
  detailId: number;
  data: FacilityDetail
}

export default function FacilityDetailUpdateFormPage({
  facilityId,
  detailId,
  data
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FacilityDetailFormData>({
    year: data.year.toString(),
    overnight_stays: data.overnight_stays.toString(),
    total_revenue: data.total_revenue.toString(),
    guests: data.guests.toString(),
    rooms_sold: data.rooms_sold?.toString(),
    personnel_costs: data.personnel_costs.toString(),
    material_goods_costs: data.material_goods_costs?.toString(),
    energy_costs: data.energy_costs.toString(),
    outsourced_services_costs: data.outsourced_services_costs.toString(),
    other_operating_costs: data.other_operating_costs.toString(),
    donations_subsidies_income: data.donations_subsidies_income?.toString(),
    other_income: data.other_income?.toString(),
    catering_income: data.catering_income?.toString(),
    accommodation_income: data.accommodation_income?.toString(),
    repair_maintenance_costs: data.repair_maintenance_costs?.toString(),
    depreciation_costs: data.depreciation_costs?.toString(),
    rent_lease_costs: data.rent_lease_costs?.toString(),
    total_groups: data.total_groups?.toString(),
    own_groups: data.own_groups?.toString(),
    own_participants: data.own_participants?.toString(),
    returning_groups: data.returning_groups?.toString(),
    pers_admin_hours: data.pers_admin_hours?.toString(),
    pers_admin_wage: data.pers_admin_wage?.toString(),
    pers_kitchen_hours: data.pers_kitchen_hours?.toString(),
    pers_kitchen_wage: data.pers_kitchen_wage?.toString(),
    pers_cleaning_hours: data.pers_cleaning_hours?.toString(),
    pers_cleaning_wage: data.pers_cleaning_wage?.toString(),
    pers_tech_hours: data.pers_tech_hours?.toString(),
    pers_tech_wage: data.pers_tech_wage?.toString(),
    pers_edu_hours: data.pers_edu_hours?.toString(),
    pers_edu_wage: data.pers_edu_wage?.toString(),
    is_published: data.is_published
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    setSubmitting(true);
    e.preventDefault();
    setErrors({});

    const result = facilityDetailSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0];
        if (field) fieldErrors[field as string] = issue.message;
      });

      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      const { rooms_sold, outsourced_services_costs, ...rest } = result.data;
      // Drop empty optional values; reset the two zero-defaulted fields to "0" when cleared.
      const cleanedRest = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== "" && value !== undefined)
      );
      const payload = {
        ...cleanedRest,
        rooms_sold: rooms_sold?.length ? rooms_sold : "0",
        outsourced_services_costs: outsourced_services_costs?.length ? outsourced_services_costs : "0",
      } as typeof result.data;
      const res = await updateFacilityYearlyData(facilityId, detailId, payload);
      if (res.status === 'success') {
        router.replace(`/facilities/${facilityId}/detail`);
      } else {
        setErrors({ year: "Sie verfügen bereits über Daten für dieses Jahr." });
      }
    } catch (error: unknown) {
      if (error instanceof Error) setErrors({ form: error.message });
      else setErrors({ form: "Unbekannter Fehler." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FacilityDetailCreateForm
      id={facilityId.toString()}
      form={form}
      setFormAction={setForm}
      errors={errors}
      setErrorsAction={setErrors}
      onSubmitAction={handleSubmit}
      submitting={submitting}
      categoryName={data.category_name}
    />
  );
}
