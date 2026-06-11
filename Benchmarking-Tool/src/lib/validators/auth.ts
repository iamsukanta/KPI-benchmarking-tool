import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Ungültige E-Mail-Adresse.'),
  password: z.string().min(1, 'Passwort ist erforderlich.')
});

export const signupSchema = z.object({
  first_name: z.string().min(1, 'Vorname erforderlich.'),
  last_name: z.string().min(1, 'Nachname erforderlich.'),
  email: z.email('Ungültige E-Mail-Adresse.'),
  facility: z.string().min(1, 'Bitte wählen Sie eine Einrichtung aus.'),
  is_federation_manager: z.boolean().optional(),
  password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Die Passwörter stimmen nicht überein.'
});

export const profileSchema = z.object({
  first_name: z.string().min(1, 'Vorname erforderlich.'),
  last_name: z.string().min(1, 'Nachname erforderlich.'),
  email: z.email('Ungültige E-Mail-Adresse.')
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Das alte Passwort wird benötigt.'),
  new_password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
  confirm_new_password: z.string().min(8, 'Passwortbestätigung erforderlich.')
}).refine(data => data.new_password === data.confirm_new_password, {
  path: ['confirm_new_password'],
  message: 'Die Passwörter stimmen nicht überein.'
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
