import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/features/users/services/user.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { CreateUserPayload } from "@/features/users/types";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
}
