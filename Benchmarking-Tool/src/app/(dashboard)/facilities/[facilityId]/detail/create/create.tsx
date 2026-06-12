"use client";

import FacilityDetailCreateForm from "@/app/(dashboard)/facilities/[facilityId]/detail/create/form";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { facilityDetailSchema, FacilityDetailFormData } from "@/lib/validators/facility";
import { retrieveFacility, createFacilityDetail } from "@/lib/api/facilities";
import { Facility } from "@/lib/types/facilities";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBuilding } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function FacilityDetailCreateFormPage({
  facilityId,
}: {
  facilityId: string;
}) {
  const router = useRouter();
  const [facility, setFacility] = useState<Facility>();
  const [form, setForm] = useState<FacilityDetailFormData>({
    year: "",
    overnight_stays: "",
    total_revenue: "",
    guests: "",
    rooms_sold: "",
    personnel_costs: "",
    material_goods_costs: "",
    energy_costs: "",
    outsourced_services_costs: "",
    other_operating_costs: "",
    donations_subsidies_income: "",
    other_income: "",
    catering_income: "",
    accommodation_income: "",
    is_published: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { results } = await retrieveFacility(facilityId);
      setFacility(results);
    }
    load();
  }, [facilityId]);

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
      // Drop empty optional values so nullable fields are sent as absent, not "".
      const payload = Object.fromEntries(
        Object.entries(result.data).filter(([, value]) => value !== "" && value !== undefined)
      ) as typeof result.data;
      const res = await createFacilityDetail(facilityId, payload);
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <Link
          href={`/facilities/${facilityId}/detail`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
          <span>Zurück zu den Jahresdaten</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Fügen Sie die Jahresdetails des {facility?.name} hinzu</h1>
            <p className="text-sm text-slate-500 mt-0.5">Jährliche Daten</p>
          </div>
        </div>
      </div>

      <FacilityDetailCreateForm
        id={facilityId}
        form={form}
        setFormAction={setForm}
        errors={errors}
        setErrorsAction={setErrors}
        onSubmitAction={handleSubmit}
        submitting={submitting}
        categoryName={facility?.category_name}
      />
    </div>
  );
}
