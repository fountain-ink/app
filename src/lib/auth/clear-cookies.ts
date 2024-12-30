import { deleteCookie, getCookies } from "cookies-next";

export const clearCookies = () => {
  // delete all cookies
  const cookies = getCookies();
  
  for (const cookieName of Object.keys(cookies)) {
    deleteCookie(cookieName);
  }
};
