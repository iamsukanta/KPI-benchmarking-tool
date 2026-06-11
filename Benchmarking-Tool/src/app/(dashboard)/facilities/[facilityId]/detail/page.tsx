import FacilityDetailTable from "@/app/(dashboard)/facilities/_components/facility-detail-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jährliche Daten"
}

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  return <FacilityDetailTable id={facilityId} />;
}
