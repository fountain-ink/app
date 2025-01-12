import { getCookie } from "cookies-next";

export const useProfileId = () => {
  const refreshToken = getCookie("appToken");

  if (!refreshToken) {
    return null;
  }

  try {
    const [, payload] = refreshToken.split(".");
    if (!payload) {
      return null;
    }
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.id as string;
  } catch (error) {
    console.error("Failed to decode refresh token:", error);
    return null;
  }
};
