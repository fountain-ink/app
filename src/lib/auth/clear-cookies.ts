import { deleteCookie, getCookies } from "cookies-next";

export const clearAllCookies = () => {
  const cookies = getCookies();
  
  for (const cookieName of Object.keys(cookies)) {
    deleteCookie(cookieName);
  }
};


export const clearAuthCookies = () => {
  // delete all cookies
  const cookies = getCookies();
  
  deleteCookie("appToken");
  deleteCookie("refreshToken");
};
