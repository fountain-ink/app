import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { IStorageProvider } from "@lens-protocol/client";

export const cookieStorage: IStorageProvider = {
  getItem(key: string) {
    const value = getCookie(key);
    
    return value || null;
  },
  setItem(key: string, value: string) {
    setCookie(key, value);
  },

  removeItem(key: string) {
    deleteCookie(key);
  },
};
