import { getBaseUrl } from "../get-base-url";

export async function getUserSettings(address: string) {
  const url = getBaseUrl();
  const response = await fetch(`${url}/api/users/${address}/settings`, {
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch user settings");
    return null;
  }

  const data = await response.json();
  return data.settings;
}