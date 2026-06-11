import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Metadata } from "next";
import { getAllInvitations } from "@/lib/api/user-invitations";
import UserInvitationWrapper from "./wrapper";

export const metadata: Metadata = {
  title: "Benutzereinladungen",
};

export default async function UserInvitationPage() {
  const { results: initialInvitations } = await getAllInvitations();

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faUserPlus} className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Benutzereinladungen</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Laden Sie Benutzer ein, das Benchmarking-Tool zu verwalten
            </p>
          </div>
        </div>
      </div>

      <UserInvitationWrapper initialInvitations={initialInvitations} />
    </>
  );
}
