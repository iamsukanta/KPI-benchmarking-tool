// Categories that receive the V2 / Netzwerk-2 fields & KPIs (Cat.1 Hotels + Cat.2
// Tagungshaus). Matched by name so category IDs can change safely — mirrors the
// backend `V2_ELIGIBLE_CATEGORY_NAMES` in apps/facilities/constants.py.
export const V2_ELIGIBLE_CATEGORY_NAMES = [
  "Hotels / Tagungshotels",
  "Tagungshaus / Familienferienstatte",
];

export function isV2Eligible(categoryName?: string): boolean {
  return !!categoryName && V2_ELIGIBLE_CATEGORY_NAMES.includes(categoryName);
}
