import { IStorageProvider } from "@lens-protocol/client";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

export const cookieStorage: IStorageProvider = {
  async getItem(key: string) {
    const { cookies } = await import("next/headers");
    const value = getCookie(key, { cookies });

    return value ?? null;
  },
  setItem(key: string, value: string) {
    setCookie(key, value);
  },

  removeItem(key: string) {
    deleteCookie(key);
  },
};

export const clientCookieStorage: IStorageProvider = {
  async getItem(key: string) {
    const value = getCookie(key);

    return value ?? null;
  },
  setItem(key: string, value: string) {
    setCookie(key, value);
  },

  removeItem(key: string) {
    deleteCookie(key);
  },
};
