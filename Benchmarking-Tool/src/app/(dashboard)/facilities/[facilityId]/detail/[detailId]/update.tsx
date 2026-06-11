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
    catering_costs: data.catering_costs?.toString(),
    energy_costs: data.energy_costs.toString(),
    cleaning_costs: data.cleaning_costs.toString(),
    maintenance_costs: data.maintenance_costs.toString(),
    income_from_donations: data.income_from_donations?.toString(),
    income_from_conferences: data.income_from_conferences?.toString(),
    income_from_catering: data.income_from_catering?.toString(),
    income_from_accomodation: data.income_from_accomodation?.toString(),
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
      const { rooms_sold, cleaning_costs, ...rest } = result.data;
      const payload = {
        ...rest,
        ...(rooms_sold?.length ? { rooms_sold } : { rooms_sold: "0" }),
        ...(cleaning_costs?.length ? { cleaning_costs } : { cleaning_costs: "0" }),
      };
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
    />
  );
}
