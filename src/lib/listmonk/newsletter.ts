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
 * Creates the Authorization header for Listmonk API requests
 */
const getAuthHeader = () => {
  return `Basic ${Buffer.from(`${env.LISTMONK_API_USERNAME}:${env.LISTMONK_API_TOKEN}`).toString("base64")}`;
};

/**
 * Creates a mailing list for a blog
 * @param blogIdentifier - The blog address or handle
 * @returns The response data or null if there was an error
 */
export async function createMailingList(blogIdentifier: string): Promise<NewsletterResponse | null> {
  try {
    const response = await fetch(`/api/newsletter/${blogIdentifier}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error creating mailing list:', data.error);
      return data;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating mailing list:', error);
    return null;
  }
}

/**
 * Subscribes an email to a blog's mailing list
 * @param blogIdentifier - The blog address or handle
 * @param email - The email to subscribe
 * @returns The response data or null if there was an error
 */
export async function subscribeToNewsletter(blogIdentifier: string, email: string): Promise<NewsletterResponse | null> {
  try {
    const response = await fetch(`/api/newsletter/${blogIdentifier}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error subscribing to newsletter:', data.error);
      return data;
    }
    
    return data;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return null;
  }
} 