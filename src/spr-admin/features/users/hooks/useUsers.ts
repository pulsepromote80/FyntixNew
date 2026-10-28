import { useQuery } from "@tanstack/react-query";
import { userService } from "@/spr-admin/features/users/services/user.service";
import { QUERY_KEYS } from "@/spr-admin/lib/constants";
import type { PaginationParams } from "@/spr-admin/types/api";

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users.all, params],
    queryFn: () => userService.list(params),
  });
}
