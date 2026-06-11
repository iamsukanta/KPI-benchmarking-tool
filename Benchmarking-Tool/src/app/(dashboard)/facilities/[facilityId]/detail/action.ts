"use server";

import { getFacilityYearlyData } from "@/lib/api/facilities-server";
import { FacilityDetail } from "@/lib/types/facilities";

export async function fetchFacilityYearlyData(facilityId: number, detailId: number): Promise<FacilityDetail> {
  const { results } = await getFacilityYearlyData(facilityId, detailId);
  return results;
}
