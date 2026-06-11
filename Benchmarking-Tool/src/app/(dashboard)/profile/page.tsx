import type { Metadata } from "next";
import ProfileCard from '@/app/(dashboard)/profile/card';

export const metadata: Metadata = {
  title: "Profil"
}

export default function ProfilePage() {
  return <ProfileCard />;
}
