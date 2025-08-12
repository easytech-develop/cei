import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    session,
    isAuthenticated,
    isLoading,
  };
}

export function useRequireAuth(redirectTo = "/auth/signin") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  return {
    session,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
