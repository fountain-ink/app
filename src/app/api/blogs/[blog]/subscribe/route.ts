import { getListById, createList, addSubscriber } from "@/lib/listmonk/client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEvmAddress } from "@/lib/utils/address";

async function findBlogByIdentifier(db: any, identifier: string) {
  if (isEvmAddress(identifier)) {
    return await db
      .from("blogs")
      .select("*")
      .eq("address", identifier)
      .single();
  } else {
    return await db
      .from("blogs")
      .select("*")
      .eq("handle", identifier)
      .single();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { blog: string } }
) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    
    // Get blog data by identifier (address or handle)
    const db = await createClient();
    const { data: blog, error } = await findBlogByIdentifier(db, params.blog);
    
    if (error || !blog) {
      console.error("Error fetching blog data:", error);
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    
    let listId: number | null = blog.mail_list_id || null;
    let list = null;
    
    if (listId) {
      list = await getListById(listId);
    }
    
    if (!list) {
      const blogTitle = blog.title || `Blog (${blog.address})`;
      const listName = `${blog.address}`;
      const description = `Subscribers to the blog "${blogTitle} (${blog.address})"`;
      
      list = await createList(listName, description);
      
      if (!list) {
        return NextResponse.json({ error: "Failed to create mailing list" }, { status: 500 });
      }
      
      const { error: updateError } = await db
        .from("blogs")
        .update({ mail_list_id: list.id })
        .eq("address", blog.address);
      
      if (updateError) {
        console.error("Error updating blog with mail_list_id:", updateError);
      }
      
      listId = list.id;
    }
    
    if (!listId) {
      return NextResponse.json({ error: "Failed to get or create mailing list" }, { status: 500 });
    }
    
    const subscriber = await addSubscriber(email, [listId]);
    
    if (!subscriber) {
      return NextResponse.json({ error: "Failed to add subscriber" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Successfully subscribed to the blog",
      data: {
        listId: list.id,
        listName: list.name,
        subscriberId: subscriber.id,
        email: subscriber.email
      }
    });
    
  } catch (error) {
    console.error("Error subscribing to blog:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to subscribe to blog" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; 