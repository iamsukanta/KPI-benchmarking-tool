import FacilityUpdateForm from "@/app/(dashboard)/facilities/_components/facility-update-form";
import { getServerUser } from "@/lib/auth/server";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update-Funktion"
}

export default async function FacilityUpdatePage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  return <FacilityUpdateForm id={facilityId} />;
}
