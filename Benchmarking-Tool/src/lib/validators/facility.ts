import { z } from "zod";

export const facilitySchema = z.object({
  category: z.string().min(1, "Wählen Sie eine Kategorie aus."),
  name: z.string().min(1, "Der Name der Einrichtung ist erforderlich."),
  federal_state: z.boolean().optional(),
  beds: z.string().optional(),
  rooms: z.string().optional(),
  opening_days_per_year: z.string().min(1, "Es werden Öffnungstage pro Jahr benötigt."),
  operational_building_area: z.string().optional(),
  total_property_area: z.string().optional(),
  is_federation: z.boolean().optional(),
  federation: z.string().optional()
}).superRefine((data, ctx) => {
  if (! data.is_federation) {
    if (! data.beds || data.beds.length < 1) {
      ctx.addIssue({ code: "custom", message: "Bett ist erforderlich.", path: ["beds"] });
    }
    if (!data.rooms || data.rooms.length < 1) {
      ctx.addIssue({ code: "custom", message: "Zimmer ist erforderlich.", path: ["rooms"] });
    }
  }
});

export const facilityDetailSchema = z.object({
  year: z.string().min(1, "Jahr ist erforderlich."),
  overnight_stays: z.string().min(1, "Übernachtungen sind erforderlich."),
  total_revenue: z.string().min(1, "Es werden die Gesamteinnahmen benötigt."),
  guests: z.string().min(1, "Die Anzahl der Ankünfte wird benötigt."),
  rooms_sold: z.string().optional().refine(
    (val) => val === undefined || val === "" || Number.isInteger(Number(val)),
    { message: "Die verkauften Zimmer müssen eine ganze Zahl sein." }
  ),
  personnel_costs: z.string().min(1, "Personalkosten fallen an."),
  material_goods_costs: z.string().min(1, "Die Kosten für Material / Wareneinkauf werden benötigt."),
  energy_costs: z.string().min(1, "Die Energiekosten werden benötigt."),
  outsourced_services_costs: z.string().optional().refine(
    (val) => val === undefined || val === "" || Number.isInteger(Number(val)),
    { message: "Der Einsatz von Fremdfirmen muss eine ganze Zahl sein." }
  ),
  other_operating_costs: z.string().min(1, "Die sonstigen Sachkosten werden benötigt."),
  donations_subsidies_income: z.string().optional(),
  other_income: z.string().optional(),
  catering_income: z.string().optional(),
  accommodation_income: z.string().optional(),
  // V2 / Netzwerk-2 — optional, shown only for cat.1 + cat.2
  repair_maintenance_costs: z.string().optional(),
  depreciation_costs: z.string().optional(),
  rent_lease_costs: z.string().optional(),
  total_groups: z.string().optional(),
  own_groups: z.string().optional(),
  own_participants: z.string().optional(),
  returning_groups: z.string().optional(),
  pers_admin_hours: z.string().optional(),
  pers_admin_wage: z.string().optional(),
  pers_kitchen_hours: z.string().optional(),
  pers_kitchen_wage: z.string().optional(),
  pers_cleaning_hours: z.string().optional(),
  pers_cleaning_wage: z.string().optional(),
  pers_tech_hours: z.string().optional(),
  pers_tech_wage: z.string().optional(),
  pers_edu_hours: z.string().optional(),
  pers_edu_wage: z.string().optional(),
  is_published: z.boolean()
});

export const benchmarkSchema = z.object({
  year: z.string().min(1, "Wählen Sie ein Jahr aus."),
  category: z.string().min(1, "Wählen Sie eine Kategorie aus."),
  facility: z.string().min(1, "Wählen Sie Ihre Einrichtung aus.")
});

export type FacilityFormData = z.infer<typeof facilitySchema>;
export type FacilityDetailFormData = z.infer<typeof facilityDetailSchema>;
export type BenchmarkFormData = z.infer<typeof benchmarkSchema>;
