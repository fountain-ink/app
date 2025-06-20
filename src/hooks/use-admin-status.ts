import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { getTokenClaims } from "@/lib/auth/get-token-claims";

export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        const appToken = getCookie("appToken");

        if (appToken) {
          const claims = getTokenClaims(appToken);
          setIsAdmin(!!claims?.metadata?.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, isLoading };
};
