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

export interface ListmonkSubscriberResponse {
  data: {
    results: ListmonkSubscriber[];
    query: string;
    total: number;
    per_page: number;
    page: number;
  };
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
        Authorization: getAuthHeader(),
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
 * Creates a new list in Listmonk
 */
export async function createList(name: string, description: string): Promise<ListmonkList | null> {
  try {
    const response = await fetch(`${env.LISTMONK_API_URL}/lists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
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
export async function addSubscriber(email: string, listId: number): Promise<ListmonkSubscriber | null> {
  try {
    const response = await fetch(`${env.LISTMONK_API_URL}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        email,
        name: email.split("@")[0],
        status: "enabled",
        lists: [listId],
        preconfirm_subscription: true,
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

/**
 * Imports subscribers from a CSV file
 */
export async function importSubscribers(file: File, listIds: number[]): Promise<boolean> {
  try {
    const formData = new FormData();
    const params = {
      mode: "subscribe",
      subscription_status: "confirmed",
      delim: ",",
      lists: listIds,
      overwrite: true
    };

    formData.append('params', JSON.stringify(params));
    formData.append('file', file);

    const response = await fetch(`${env.LISTMONK_API_URL}/import/subscribers`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      console.error(`Failed to import subscribers: ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error importing subscribers:", error);
    return false;
  }
}

/**
 * Fetches subscribers from a list
 */
export async function getSubscribers(listId?: number, page: number = 1, perPage: number = 100): Promise<ListmonkSubscriberResponse | null> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (listId) {
      params.append('list_id', listId.toString());
    }

    const response = await fetch(`${env.LISTMONK_API_URL}/subscribers?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch subscribers: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return null;
  }
}
