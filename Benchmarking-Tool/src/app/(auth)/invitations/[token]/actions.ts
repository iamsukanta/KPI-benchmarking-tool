import { AcceptInvitationResponse, InvitationVerificationRequest } from "@/lib/types/user-invitations";
import { AcceptInvitationFormData, acceptInvitationSchema } from "@/lib/validators/user-invitation";

export async function verifyInvitationRequest(token: string): Promise<InvitationVerificationRequest> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/auth/user-invitations/${token}/verify/`, {
    method: "POST"
  });
  return res.json();
}

async function acceptInvitationRequest(data: AcceptInvitationFormData): Promise<AcceptInvitationResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/auth/user-invitations/accept/`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json"
    }
  });
  return res.json();
}

export type AcceptInvitationState = {
  success?: string;
  errors?: Record<string, string>;
}

export async function acceptInvitationAction(
  _prev: AcceptInvitationState,
  formData: FormData
): Promise<AcceptInvitationState> {
  const raw = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    token: formData.get("token")
  };
  const result = acceptInvitationSchema.safeParse(raw);

  if (! result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach(issue => {
      const field = String(issue.path[0]);
      if (field) errors[field] = issue.message;
    });
    return { errors };
  }

  try {
    const res = await acceptInvitationRequest(result.data);
    if (res.status === 'success') return { success: res.message }
    else {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(res.errors)) {
        fieldErrors[key] = value?.[0] ?? "";
      }
      return { errors: fieldErrors };
    }
  } catch (e: unknown) {
    return {
      errors: {
        form: e instanceof Error ? e.message : "Es ist ein unbekannter Fehler aufgetreten.",
      }
    }
  }
}
