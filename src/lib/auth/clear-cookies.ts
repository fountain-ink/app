import { deleteCookie, getCookies } from "cookies-next";

export const clearAllCookies = () => {
  const cookies = getCookies();
  
  for (const cookieName of Object.keys(cookies)) {
    deleteCookie(cookieName);
  }
};


export const clearAuthCookies = () => {
  deleteCookie("appToken");
  deleteCookie("refreshToken");
};
