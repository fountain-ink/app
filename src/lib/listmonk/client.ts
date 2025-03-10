import { env } from "@/env";

export interface ListmonkList {
  id: number;
  uuid: string;
  name: string;
  type: string;
  optin: string;
  tags: string[];
  description?: string;
  created_at: string;
  updated_at: string;
  subscriber_count?: number;
}

export interface ListmonkSubscriber {
  id: number;
  uuid: string;
  email: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creates the Authorization header for Listmonk API requests
 */
const getAuthHeader = () => {
  return `Basic ${Buffer.from(`${env.LISTMONK_API_USERNAME}:${env.LISTMONK_API_TOKEN}`).toString("base64")}`;
};

/**
 * Fetches a list by ID from Listmonk
 */
export async function getListById(listId: number): Promise<ListmonkList | null> {
  try {
    const response = await fetch(`${env.LISTMONK_API_URL}/lists/${listId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch list: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching list by ID:", error);
    return null;
  }
}

/**
 * Fetches all lists from Listmonk
 */
export async function getAllLists(): Promise<ListmonkList[]> {
  try {
    const response = await fetch(`${env.LISTMONK_API_URL}/lists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch lists: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.data.results || [];
  } catch (error) {
    console.error("Error fetching lists:", error);
    return [];
  }
}

/**
 * Creates a new list in Listmonk
 */
export async function createList(name: string, description: string): Promise<ListmonkList | null> {
  try {
    const response = await fetch(`${env.LISTMONK_API_URL}/lists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(),
      },
      body: JSON.stringify({
        name,
        description,
        type: "private",
        optin: "single",
        tags: ["blog"],
      }),
    });

    if (!response.ok) {
      console.error(`Failed to create list: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating list:", error);
    return null;
  }
}

/**
 * Adds a subscriber to a list in Listmonk
 */
export async function addSubscriber(email: string, listIds: number[]): Promise<ListmonkSubscriber | null> {
  try {
    const response = await fetch(`${env.LISTMONK_API_URL}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(),
      },
      body: JSON.stringify({
        email,
        name: email.split("@")[0], // Use part before @ as name
        status: "enabled",
        lists: listIds,
        preconfirm_subscription: true, // For single opt-in
      }),
    });

    if (!response.ok) {
      console.error(`Failed to add subscriber: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error adding subscriber:", error);
    return null;
  }
}