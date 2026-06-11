import { z } from "zod";

export const userInvitationSchema = z.object({
  email: z.email("Ungültige E-Mail-Adresse."),
});

export const acceptInvitationSchema = z.object({
  first_name: z.string().min(1, "Vorname erforderlich."),
  last_name: z.string().min(1, "Nachname erforderlich."),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein."),
  token: z.string().min(1, "Token erforderlich"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Die Passwörter stimmen nicht überein."
});

export type UserInvitationFormData = z.infer<typeof userInvitationSchema>;
export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;
