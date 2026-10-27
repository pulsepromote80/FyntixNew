import { useQuery } from "@tanstack/react-query";
import { userService } from "@/features/users/services/user.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { PaginationParams } from "@/types/api";

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users.all, params],
    queryFn: () => userService.list(params),
  });
}
