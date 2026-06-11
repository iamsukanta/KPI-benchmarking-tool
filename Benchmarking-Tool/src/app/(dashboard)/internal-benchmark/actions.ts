"use server";

import { serverFetch } from "@/lib/api";
import { InternalBenchmarkResponse } from "@/lib/types/benchmark";

export async function internalBenchmarkPreparation(federationId: number): Promise<{ status: "success", results: number[] }> {
  const res = await serverFetch(`/internal-benchmark/?federation=${federationId}`);
  return res.json();
}

export async function submitInternalBenchmark(federationId: number, year: number): Promise<InternalBenchmarkResponse> {
  const res = await serverFetch(`/internal-benchmark/benchmark/?federation=${federationId}&year=${year}`);
  return res.json();
}
