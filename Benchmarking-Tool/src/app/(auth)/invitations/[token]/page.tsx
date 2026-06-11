import type { Metadata } from "next";
import { verifyInvitationRequest } from "./actions";
import AcceptInvitationform from "./accept-invitation-form";

export const metadata: Metadata = {
  title: "Einladung"
}

type Props = {
  params: Promise<{
    token: string;
  }>
}

export default async function InvitationPage({ params }: Props) {
  const { token } = await params;
  const res = await verifyInvitationRequest(token);

  if (res.status === 'error') {
    return (
      <div className="w-full md:w-1/2 py-10 flex flex-col justify-center items-center">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white mb-3">
            Einladung
          </h1>
          <p className="text-base text-slate-400">Erstellen Sie Ihr Konto</p>
        </div>

        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400 text-center">{res.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 py-10 flex flex-col justify-center items-center">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white mb-3">
          Einladung
        </h1>
        <p className="text-base text-slate-400">Erstellen Sie Ihr Konto</p>
      </div>

      <AcceptInvitationform token={token} email={res.results} />
    </div>
  );
}
