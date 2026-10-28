import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/spr-admin/features/users/services/user.service";
import { QUERY_KEYS } from "@/spr-admin/lib/constants";
import type { CreateUserPayload } from "@/spr-admin/features/users/types";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
}
