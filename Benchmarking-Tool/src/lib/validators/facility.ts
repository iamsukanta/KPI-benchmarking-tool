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
  catering_costs: z.string().min(1, "Die Kosten für Waren/Catering werden benötigt."),
  energy_costs: z.string().min(1, "Die Energiekosten werden benötigt."),
  cleaning_costs: z.string().optional().refine(
    (val) => val === undefined || val === "" || Number.isInteger(Number(val)),
    { message: "Die Reinigungskosten müssen eine ganze Zahl sein." }
  ),
  maintenance_costs: z.string().min(1, "Die Kosten für Sachkosten (gesamt) werden übernommen."),
  income_from_donations: z.string().optional(),
  income_from_conferences: z.string().optional(),
  income_from_catering: z.string().optional(),
  income_from_accomodation: z.string().optional(),
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
