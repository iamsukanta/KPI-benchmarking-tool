import type { Metadata } from "next";
import { getUnapprovedUserFacilities } from "@/lib/api/facilities";
import SignupForm from "@/app/(auth)/_components/signup-form";

export const metadata: Metadata = {
  title: "Melden Sie sich an",
};

export default async function SignupPage() {
  const { results } = await getUnapprovedUserFacilities();

  const facilities = (results ?? []).map((facility) => ({
    label: facility.name,
    value: facility.id.toString(),
  }));

  return <SignupForm facilities={facilities} />;
}
