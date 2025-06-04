import { env } from "@/env";
import { createClient } from "../db/client";
import { findBlogByIdentifier } from "../utils/find-blog-by-id";
import { ListmonkCampaignResponse } from "@/srv/notifications/types";

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
  lists?: any[];
  attribs?: {
    campaign_views?: number;
    [key: string]: any;
  };
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
 * Finds a subscriber by email
 */
export async function findSubscriberByEmail(email: string): Promise<ListmonkSubscriber | null> {
  try {
    const params = new URLSearchParams({
      query: `email='${email}'`,
    });

    const response = await fetch(`${env.LISTMONK_API_URL}/subscribers?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error(`Failed to find subscriber: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.data.results.length > 0) {
      return data.data.results[0];
    }
    return null;
  } catch (error) {
    console.error("Error finding subscriber by email:", error);
    return null;
  }
}

/**
 * Adds an existing subscriber to a list
 */
export async function addSubscriberToList(subscriberId: number, listId: number): Promise<ListmonkSubscriber | null> {
  try {
    const response = await fetch(`${env.LISTMONK_API_URL}/subscribers/${subscriberId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error(`Failed to get subscriber: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const subscriber = data.data;

    const currentLists = subscriber.lists.map((list: any) => list.id);

    if (!currentLists.includes(listId)) {
      currentLists.push(listId);
    }

    const updateResponse = await fetch(`${env.LISTMONK_API_URL}/subscribers/${subscriberId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        email: subscriber.email,
        name: subscriber.name,
        status: subscriber.status,
        lists: currentLists,
        attribs: subscriber.attribs || {},
        preconfirm_subscription: true,
      }),
    });

    if (!updateResponse.ok) {
      console.error(`Failed to update subscriber: ${updateResponse.status} ${updateResponse.statusText}`);
      return null;
    }

    const updateData = await updateResponse.json();
    return updateData.data;
  } catch (error) {
    console.error("Error adding subscriber to list:", error);
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
      // If we get a 409 Conflict, the subscriber already exists
      if (response.status === 409) {
        console.log(`Subscriber ${email} already exists. Attempting to add to list ${listId}`);

        const existingSubscriber = await findSubscriberByEmail(email);

        if (existingSubscriber) {
          return await addSubscriberToList(existingSubscriber.id, listId);
        }
      }

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
      overwrite: true,
    };

    formData.append("params", JSON.stringify(params));
    formData.append("file", file);

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
export async function getSubscribers(
  listId?: number,
  page = 1,
  perPage = 100,
  query?: string,
): Promise<ListmonkSubscriberResponse | null> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (listId) {
      params.append("list_id", listId.toString());
    }

    if (query) {
      params.append("query", query);
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

/**
 * Deletes a list from Listmonk
 */
export async function deleteList(listId: number): Promise<boolean> {
  try {
    const response = await fetch(`${env.LISTMONK_API_URL}/lists/${listId}`, {
      method: "DELETE",
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error(`Failed to delete list: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    return data.data === true;
  } catch (error) {
    console.error("Error deleting list:", error);
    return false;
  }
}

/**
 * Finds a subscriber by email
 */
export async function findSubscriber(email: string): Promise<any | null> {
  try {
    const response = await fetch(
      `${env.LISTMONK_API_URL}/subscribers?query=subscribers.email = '${email}'`,
      {
        method: "GET",
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to find subscriber: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error finding subscriber:", error);
    return null;
  }
}

/**
 * Deletes a subscriber by ID
 */
export async function deleteSubscriber(subscriberId: number): Promise<boolean> {
  try {
    const response = await fetch(`${env.LISTMONK_API_URL}/subscribers/${subscriberId}`, {
      method: "DELETE",
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error(`Failed to delete subscriber: ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return false;
  }
}

/**
 * Bulk deletes subscribers by IDs using Listmonk's bulk delete API
 */
export async function bulkDeleteSubscribers(subscriberIds: number[]): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    subscriberIds.forEach(id => params.append("id", id.toString()));

    const response = await fetch(`${env.LISTMONK_API_URL}/subscribers?${params.toString()}`, {
      method: "DELETE",
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error(`Failed to bulk delete subscribers: ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error bulk deleting subscribers:", error);
    return false;
  }
}

/**
 * Creates a Listmonk campaign from a new post
 */
export async function createCampaignForPost(
  listId: number,
  blogId: string,
  postId: string,
  authorAddress: string,
  postMetadata?: string,
) {
  try {
    const db = await createClient();
    const { data: blog, error } = await findBlogByIdentifier(db, blogId);

    if (error || !blog) {
      console.error("Error fetching blog data:", error);
      return null;
    }

    if (!listId) {
      console.error("No mailing list ID provided");
      return null;
    }

    let postTitle = "New Post";
    let postContent = "Check out the new post!";
    let postSubtitle = "";
    let postUrl = `https://fountain.ink/p/${postId}`;
    let coverImageUrl = "";
    let username = "";

    if (postMetadata) {
      try {
        const metadata = JSON.parse(postMetadata);
        postTitle = metadata.title || postTitle;
        postSubtitle = metadata.subtitle || "";
        postContent = metadata.content || postContent;
        coverImageUrl = metadata.coverUrl || "";
        username = metadata.username || "";

        if (username) {
          postUrl = `https://fountain.ink/p/${username}/${postId}`;
        }

        if (postContent.length > 300) {
          postContent = `${postContent.substring(0, 300)}...`;
        }
      } catch (e) {
        console.error("Error parsing post metadata:", e);
      }
    }

    const campaignBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${postTitle}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { font-size: 24px; margin-bottom: 10px; }
          h2 { font-size: 20px; margin-bottom: 10px; color: #555; font-weight: normal; }
          .cover { max-width: 100%; height: auto; margin-bottom: 20px; }
          .content { margin-bottom: 30px; }
          .button {
            display: inline-block;
            background-color: #0070f3;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer { 
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div>
          <h1>${postTitle}</h1>
          ${postSubtitle ? `<h2>${postSubtitle}</h2>` : ""}
          ${coverImageUrl ? `<img src="${coverImageUrl}" alt="Post cover image" class="cover" />` : ""}
          
          <div class="content">
            ${postContent.replace(/\n/g, "<br>")}
          </div>
          
          <a href="${postUrl}" class="button">Read the full post</a>
          
          <div class="footer">
            <p>You're receiving this email because you subscribed to updates from ${blog.display_name || blogId} on Fountain.</p>
            <p>To unsubscribe from these emails, click <a href="{{UnsubscribeURL}}">here</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch(`${env.LISTMONK_API_URL}/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        name: `New post: ${postTitle}`,
        subject: `${postTitle}`,
        // subject: `${blog.display_name || blogId}: ${postTitle}`,
        lists: [listId],
        from_email: `${blog.display_name || blogId} <noreply@fountain.ink>`,
        content_type: "html",
        type: "regular",
        body: campaignBody,
        status: "draft", // or 'scheduled' to send automatically
      }),
    });

    if (!response.ok) {
      console.error("Failed to create campaign:", response.status, response.statusText);
      return null;
    }

    const responseData = (await response.json()) as ListmonkCampaignResponse;

    const campaignId = responseData.data.id;
    const sendResponse = await fetch(`${env.LISTMONK_API_URL}/campaigns/${campaignId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        status: "running",
      }),
    });

    if (!sendResponse.ok) {
      console.error("Failed to send campaign:", sendResponse.status, sendResponse.statusText);
    } else {
      console.log(`Campaign ${campaignId} started successfully`);
    }

    return responseData.data;
  } catch (error) {
    console.error("Error creating campaign:", error);
    return null;
  }
}
