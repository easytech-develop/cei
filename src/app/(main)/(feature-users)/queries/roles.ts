import { useQuery } from "@tanstack/react-query";
import { getRoles } from "../server/users";

export const USE_GET_ROLES_KEY = ["roles"];

export function useGetRoles() {
  return useQuery({
    queryKey: USE_GET_ROLES_KEY,
    queryFn: async () => {
      const response = await getRoles();
      if (!response.success) {
        return [];
      }
      return response.data?.roles ?? [];
    },
  });
}
