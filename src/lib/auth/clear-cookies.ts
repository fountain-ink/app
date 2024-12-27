import { deleteCookie } from "cookies-next";

export const clearCookies = () => {
  deleteCookie("refreshToken");
  deleteCookie("appToken");
};
