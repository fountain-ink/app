import express from "express";
import * as bodyParser from "body-parser";
import fetch from "node-fetch";
import { createClient } from "@/lib/db/server";
import { env } from "@/env";
import { findBlogByIdentifier } from "@/lib/utils/find-blog-by-id";
import {
  SNSMessage,
  SNSMessageType,
  SNSNotification,
  SNSSubscriptionConfirmation,
  PostCreatedNotification,
  BlogRecord,
} from "./types";

import { createCampaignForPost } from "@/lib/listmonk/client";
import { BlogData } from "@/lib/settings/get-blog-data";

interface ExtendedRequest extends express.Request {
  rawBody?: Buffer;
}

const app = express();
const PORT = process.env.PORT || 8080;

const apiRouter = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  bodyParser.json({
    verify: (req: express.Request, res: express.Response, buf: Buffer) => {
      // Store the raw body for SNS message verification
      (req as ExtendedRequest).rawBody = buf;
    },
  }),
);

/**
 * Handle SNS notifications for PostCreated events
 */
app.post("/notifications", (req: express.Request, res: express.Response) => {
  (async () => {
    try {
      // Parse the raw request
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const data = Buffer.concat(buffers).toString();
      const payload = JSON.parse(data) as SNSMessage;

      console.log("Received SNS payload type:", payload.Type);

      if (payload.Type === SNSMessageType.SubscriptionConfirmation) {
        console.log("Confirming SNS subscription");
        const subscriptionPayload = payload as SNSSubscriptionConfirmation;
        const url = subscriptionPayload.SubscribeURL;
        const response = await fetch(url);

        if (response.status === 200) {
          console.log("SNS Subscription confirmed");
          return res.sendStatus(200);
        }
        console.error("SNS Subscription confirmation failed");
        return res.sendStatus(500);
      }

      if (payload.Type === SNSMessageType.Notification) {
        console.log("Received SNS notification");
        const notificationPayload = payload as SNSNotification;

        try {
          const message = JSON.parse(notificationPayload.Message) as PostCreatedNotification;

          if (message.post_id) {
            console.log("Received PostCreated notification:", message);

            const postId = message.post_id;
            const authorAddress = message.author;
            const feedAddress = message.feed;
            const appAddress = message.app;
            const postMetadata = message.metadata;

            const db = await createClient();
            const { data: blogData, error } = await db.from("blogs").select("*").eq("address", feedAddress).single();

            const blog = blogData as BlogRecord | null;

            if (error || !blog) {
              console.error("Error finding blog for feed address:", feedAddress, error);
              return res.sendStatus(200); // Acknowledge receipt even if we can't process
            }

            if (!blog.mail_list_id) {
              console.log("Blog has no mailing list:", blog.handle);
              return res.sendStatus(200);
            }

            const campaign = await createCampaignForPost(
              blog.mail_list_id,
              blog.handle || `blog-${blog.id}`, // Fallback if handle is null
              postId,
              authorAddress,
              postMetadata,
            );

            if (campaign) {
              console.log("Created campaign:", campaign.id);
            } else {
              console.error("Failed to create campaign for blog:", blog.handle);
            }
          }
        } catch (e) {
          console.error("Error processing notification:", e);
        }

        return res.sendStatus(200);
      }

      if (payload.Type === SNSMessageType.UnsubscribeConfirmation) {
        console.log("Received unsubscribe confirmation");
        return res.sendStatus(200);
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error("Error processing SNS notification:", error);
      return res.sendStatus(500);
    }
  })();
});

/**
 * Route to subscribe to SNS topics
 */
apiRouter.post("/subscribe", (req: express.Request, res: express.Response) => {
  (async () => {
    try {
      const { blogHandle, webhookUrl } = req.body;

      if (!blogHandle || !webhookUrl) {
        return res.status(400).json({ error: "Blog handle and webhook URL are required" });
      }

      // Get blog from database
      const db = await createClient();
      const { data: blogData, error } = await findBlogByIdentifier(db, blogHandle);

      // Cast to our BlogRecord type
      const blog = blogData as BlogData | null;

      if (error || !blog) {
        return res.status(404).json({ error: "Blog not found" });
      }

      if (!blog.address) {
        return res.status(400).json({ error: "Blog does not have a group address" });
      }

      // FIXME: This is temporary until we have a proper API
      const lensApiUrl = "https://lens.dev/";
      const graphqlQuery = {
        query: `
          mutation CreatePostCreatedNotification {
            createSnsSubscriptions(
              request: {
                webhook: "${webhookUrl}",
                topics: [{
                  postCreated: {
                    feed: "${blog.address}"
                  }
                }]
              }
            )
          }
        `,
      };

      // Call API to create subscription
      // FIXME: Auth is not real, use lens client in the future
      const response = await fetch(lensApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'x-api-key': process.env.LENS_API_KEY || '',
          // 'Authorization': `Bearer ${process.env.LENS_API_TOKEN || ''}`
        },
        body: JSON.stringify(graphqlQuery),
      });

      if (!response.ok) {
        console.error("Failed to create SNS subscription:", response.status, response.statusText);
        return res.status(500).json({ error: "Failed to create SNS subscription" });
      }

      const data = await response.json();

      // Update blog record with subscription info
      // Using any to bypass type checking since these fields need to be added to the schema
      try {
        await db
          .from("blogs")
          .update({
            sns_subscribed: true,
            sns_subscription_date: new Date().toISOString(),
          } as any)
          .eq("address", blog.address);
      } catch (updateError) {
        console.error("Error updating blog with SNS subscription info:", updateError);
        // Continue anyway since the subscription was created successfully
      }

      return res.status(200).json({
        success: true,
        message: "Successfully subscribed to SNS notifications",
        data: {
          blog: blog.handle,
          groupAddress: blog.address,
          subscriptionData: data,
        },
      });
    } catch (error) {
      console.error("Error subscribing to SNS:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to subscribe to SNS",
      });
    }
  })();
});

app.use("/api", apiRouter);
app.get("/health", (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: "ok" });
});

const server = app.listen(PORT, () => {
  console.log(`Notification server running on port ${PORT}`);
  console.log("SNS notification server initialized and ready to receive webhooks");
});

export default server;
