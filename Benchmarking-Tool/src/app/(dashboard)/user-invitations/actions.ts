"use server";

import {
  getAllInvitations,
  sendAnInvitation,
  resendAnInvitation,
  deleteAnInvitation,
} from "@/lib/api/user-invitations";
import { userInvitationSchema } from "@/lib/validators/user-invitation";
import {
  InviteUserResponse,
  GenericInvitationResponse,
  UserInvitation,
} from "@/lib/types/user-invitations";
import { revalidatePath } from "next/cache";

export async function fetchInvitationsAction(): Promise<UserInvitation[]> {
  const { results } = await getAllInvitations();
  return results;
}

export async function sendInvitationAction(
  formData: FormData
): Promise<InviteUserResponse> {
  const raw = { email: formData.get("email") };
  const parsed = userInvitationSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      errors: {
        email: parsed.error.flatten((issue) => issue.message).fieldErrors.email ?? [],
      },
    };
  }

  const result = await sendAnInvitation(parsed.data);
  if (result.status === "success") revalidatePath("/user-invitations");
  return result;
}

export async function resendInvitationAction(
  invitationId: number
): Promise<GenericInvitationResponse> {
  const result = await resendAnInvitation(invitationId);
  if (result.status === "success") revalidatePath("/user-invitations");
  return result;
}

export async function deleteInvitationAction(
  invitationId: number
): Promise<GenericInvitationResponse> {
  const result = await deleteAnInvitation(invitationId);
  if (result.status === "success") revalidatePath("/user-invitations");
  return result;
}
