import { env } from "@/env";

export interface NewsletterResponse {
  success?: boolean;
  error?: string;
  message?: string;
  data?: {
    listId?: number;
    listName?: string;
    subscriberId?: number;
    email?: string;
  };
  needsListCreation?: boolean;
}

/**
 * Creates a mailing list for a blog
 * @param blog - The blog address or handle
 * @returns The response data or null if there was an error
 */
export async function createMailingList(blog: string): Promise<NewsletterResponse | null> {
  try {
    const response = await fetch(`/api/newsletter/${blog}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error creating mailing list:", data.error);
      return data;
    }

    return data;
  } catch (error) {
    console.error("Error creating mailing list:", error);
    return null;
  }
}

/**
 * Subscribes an email to a blog's mailing list
 * @param blog - The blog address or handle
 * @param email - The email to subscribe
 * @returns The response data or null if there was an error
 */
export async function subscribeToNewsletter(blog: string, email: string): Promise<NewsletterResponse | null> {
  try {
    const response = await fetch(`/api/newsletter/${blog}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error subscribing to newsletter:", data.error);
      return data;
    }

    return data;
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return null;
  }
}

/**
 * Imports subscribers from a CSV file to a blog's mailing list
 * @param blog - The blog address or handle
 * @param file - The CSV file to import
 * @returns The response data or null if there was an error
 */
export async function importNewsletterSubscribers(blog: string, file: File): Promise<NewsletterResponse | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/newsletter/${blog}/import`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error importing subscribers:", data.error);
      return data;
    }

    return data;
  } catch (error) {
    console.error("Error importing subscribers:", error);
    return null;
  }
}
