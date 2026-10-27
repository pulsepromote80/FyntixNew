import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "manager", "member"]);

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  role: userRoleSchema,
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
