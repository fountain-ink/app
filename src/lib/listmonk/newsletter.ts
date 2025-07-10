export interface NewsletterResponse {
  success?: boolean;
  error?: string;
  message?: string;
  data?: {
    listId?: number;
    listName?: string;
    subscriberId?: number;
    email?: string;
    campaignId?: number;
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
    const response = await fetch(`/api/newsletter/${blog}`, {
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
    formData.append("file", file);

    const response = await fetch(`/api/newsletter/${blog}/subscribers`, {
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

/**
 * Exports subscribers from a blog's mailing list as a CSV file
 * @param blog - The blog address or handle
 */
export async function exportNewsletterSubscribers(blog: string): Promise<void> {
  try {
    const response = await fetch(`/api/newsletter/${blog}/subscribers`, {
      method: "GET",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to export subscribers");
    }

    // Get the filename from the Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/) ?? null;
    const filename = filenameMatch?.[1] ?? "subscribers.csv";

    // Create a blob from the CSV data
    const blob = await response.blob();

    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error exporting subscribers:", error);
    throw error;
  }
}

/**
 * Creates a campaign for a blog post to send to subscribers
 * @param blog - The blog address or handle
 * @param postSlug - The slug of the post
 * @param postMetadata - Metadata about the post (title, subtitle, content, coverUrl, username)
 * @returns The response data or null if there was an error
 */
export async function createCampaignForPost(
  blog: string,
  postSlug: string,
  postMetadata: {
    title: string;
    subtitle?: string;
    coverUrl?: string;
    username?: string;
  },
): Promise<NewsletterResponse | null> {
  try {
    const response = await fetch(`/api/newsletter/${blog}/campaign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postSlug,
        postMetadata: JSON.stringify(postMetadata),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error creating campaign for post:", data.error);
      return data;
    }

    return data;
  } catch (error) {
    console.error("Error creating campaign for post:", error);
    return null;
  }
}
