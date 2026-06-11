"use server";

import { serverFetch } from "@/lib/api";
import { CategoryWideBenchmarkEligibleFacility, CategoryWideBenchmarkResponse } from "@/lib/types/benchmark";

export async function eligibleFacilities(): Promise<{ status: "success", results: CategoryWideBenchmarkEligibleFacility[] }> {
  const res = await serverFetch("/category-wide-benchmark/eligible-facilities/");
  return res.json();
}

export async function submitCategoryWideBenchmark(facilityId: number, year: number): Promise<CategoryWideBenchmarkResponse> {
  const res = await serverFetch(`/category-wide-benchmark/benchmark/?facility=${facilityId}&year=${year}`);
  return res.json();
}
