import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findBlogByIdentifier } from "@/lib/utils/find-blog-by-id";
import { env } from "@/env";
import { createMailingList } from "@/lib/listmonk/newsletter";

export async function POST(req: NextRequest, { params }: { params: { blog: string } }) {
  try {
    // Get blog information
    const db = await createClient();
    const { data: blog, error } = await findBlogByIdentifier(db, params.blog);

    if (error || !blog) {
      console.error("Error fetching blog data:", error);
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Ensure the blog has a Lens group address
    if (!blog.lens_group_address) {
      return NextResponse.json(
        { error: "This blog doesn't have a group address" },
        { status: 400 }
      );
    }

    // Ensure the blog has a mailing list
    if (!blog.mail_list_id) {
      // Create a mailing list if one doesn't exist
      const listResponse = await createMailingList(blog.handle);

      if (!listResponse?.success || !listResponse?.data?.listId) {
        return NextResponse.json(
          { error: "Failed to create mailing list for the blog" },
          { status: 500 }
        );
      }

      // Update the blog with the new mailing list ID
      const { error: updateError } = await db
        .from('blogs')
        .update({ mail_list_id: listResponse.data.listId })
        .eq('id', blog.id);

      if (updateError) {
        console.error("Error updating blog with mailing list ID:", updateError);
        return NextResponse.json(
          { error: "Failed to update blog with mailing list ID" },
          { status: 500 }
        );
      }
    }

    // Get the server's webhook URL for SNS notifications
    // In production, this should be a public-facing URL
    const webhookUrl = process.env.WEBHOOK_URL || 'https://api.fntn.app/notifications';

    // Prepare GraphQL request to subscribe to SNS
    const lensApiUrl = process.env.LENS_API_URL || 'https://api-v2.lens.dev/';
    const graphqlQuery = {
      query: `
        mutation CreatePostCreatedNotification {
          createSnsSubscriptions(
            request: {
              webhook: "${webhookUrl}",
              topics: [{
                postCreated: {
                  feed: "${blog.lens_group_address}"
                }
              }]
            }
          )
        }
      `
    };

    // Call API to create subscription
    const response = await fetch(lensApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LENS_API_KEY || '',
        'Authorization': `Bearer ${process.env.LENS_API_TOKEN || ''}`
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) {
      console.error('Failed to create SNS subscription:', response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to create SNS subscription" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Update blog record with subscription info
    const { error: updateError } = await db
      .from('blogs')
      .update({
        sns_subscribed: true,
        sns_subscription_date: new Date().toISOString()
      })
      .eq('id', blog.id);

    if (updateError) {
      console.error("Error updating blog with SNS subscription info:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to SNS notifications",
      data: {
        blog: blog.handle,
        groupAddress: blog.lens_group_address,
        subscriptionData: data
      }
    });
  } catch (error) {
    console.error("Error subscribing to SNS:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to subscribe to SNS" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; 