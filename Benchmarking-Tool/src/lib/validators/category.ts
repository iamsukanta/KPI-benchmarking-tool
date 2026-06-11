import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Die Angabe eines Kategorienamens ist erforderlich.")
});

export type CategoryFormData = z.infer<typeof categorySchema>;
