import { InviteUserResponse, UserInvitationResponse, GenericInvitationResponse } from "@/lib/types/user-invitations";
import { UserInvitationFormData } from "@/lib/validators/user-invitation";
import { serverFetch } from ".";

export async function getAllInvitations(): Promise<UserInvitationResponse> {
  const res = await serverFetch("/auth/user-invitations/");
  return res.json();
}

export async function sendAnInvitation(data: UserInvitationFormData): Promise<InviteUserResponse> {
  const res = await serverFetch("/auth/user-invitations/", {
    method: "POST",
    body: JSON.stringify(data)
  })
  return res.json();
}

export async function resendAnInvitation(invitationId: number): Promise<GenericInvitationResponse> {
  const res = await serverFetch(`/auth/user-invitations/${invitationId}/`, {
    method: "PUT"
  })
  return res.json();
}

export async function deleteAnInvitation(invitationId: number): Promise<GenericInvitationResponse> {
  const res = await serverFetch(`/auth/user-invitations/${invitationId}/`, {
    method: "DELETE"
  })
  return res.json();
}
