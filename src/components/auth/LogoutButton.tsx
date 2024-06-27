"use client";

import { logout } from "@/actions/login";

export const LogOutButton: React.FC = () => {
  async function handleClick() {
    await logout();
  }
  return <button type="button" onClick={handleClick}>Log out</button>;
};