"use server";

import { signupSchema } from "@/lib/validators/auth";
import { signupRequest } from "@/lib/api/auth";

export type SignupState = {
  success?: string;
  errors?: Record<string, string>;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const isFederationManager = formData.get("is_federation_manager") === "true";

  const raw = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    is_federation_manager: isFederationManager,
    facility: formData.get("facility")
  };

  const result = signupSchema.safeParse(raw);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (field) errors[field] = issue.message;
    });
    return { errors };
  }

  try {
    const { status, message, errors } = await signupRequest(result.data);
    if (status === "success") return { success: message as string };
    if (errors) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(errors)) {
        fieldErrors[key] = value?.[0] ?? "";
      }
      return { errors: fieldErrors };
    }
    return { errors: { form: "Es ist ein unbekannter Fehler aufgetreten." } };
  } catch (error) {
    return {
      errors: {
        form: error instanceof Error ? error.message : "Es ist ein unbekannter Fehler aufgetreten.",
      },
    };
  }
}
