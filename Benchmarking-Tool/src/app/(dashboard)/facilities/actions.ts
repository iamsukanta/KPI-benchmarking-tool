"use server";
import { getAllFacilities } from "@/lib/api/facilities-server";

export async function fetchFacilitiesAction() {
  return getAllFacilities();
}
