"use client";

import { MeResult } from "@lens-protocol/client";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/db/client";
import { type Database } from "@/lib/db/database";
import { cn } from "@/lib/utils";
import { useAccountCacheStore } from "@/stores/account-cache-store";
import { ChatUserInfo } from "./chat-user-info";

type DbChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
type ChatInsert = Database["public"]["Tables"]["chat_messages"]["Insert"];

interface ChatMessage {
  id: string | number;
  content: string;
  user: {
    name: string;
    address: string;
  };
  createdAt: string;
}

interface RealtimeChatProps {
  roomName: string;
  session: MeResult | null;
  className?: string;
}

export function RealtimeChat({ roomName, session, className }: RealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createClient> | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const username =
    session?.loggedInAs.account.username?.localName || session?.loggedInAs.account.address || "Anonymous";
  const userAddress = session?.loggedInAs.account.address || "";

  // Initialize Supabase client only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupabaseClient(createClient());

      // Clean up expired cache entries periodically
      const cleanupInterval = setInterval(
        () => {
          useAccountCacheStore.getState().clearExpired();
        },
        60 * 60 * 1000,
      ); // Every hour

      return () => clearInterval(cleanupInterval);
    }
  }, []);

  // Load messages from database
  const loadMessages = useCallback(async () => {
    if (!supabaseClient) return;

    try {
      const { data, error } = await supabaseClient
        .from("chat_messages")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedMessages: ChatMessage[] = (data || []).map((msg: DbChatMessage) => ({
        id: msg.id,
        content: msg.message,
        user: {
          name: msg.author,
          address: msg.author,
        },
        createdAt: msg.created_at,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [supabaseClient]);

  // Load messages when client is ready
  useEffect(() => {
    if (supabaseClient) {
      loadMessages();
    }
  }, [supabaseClient, loadMessages]);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    // Only run when supabaseClient is initialized
    if (!supabaseClient) return;

    // Subscribe to broadcast for immediate updates
    const channel = supabaseClient
      .channel(roomName)
      .on("broadcast", { event: "message" }, (_payload) => {
        // Message already added optimistically, skip
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        }
      });

    // Subscribe to database changes
    const dbSubscription = supabaseClient
      .channel("db-chat-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as DbChatMessage;
            setMessages((current) => {
              // Check if message already exists (from optimistic update)
              const exists = current.some((msg) => msg.id === newMsg.id);
              if (!exists) {
                return [
                  ...current,
                  {
                    id: newMsg.id,
                    content: newMsg.message,
                    user: {
                      name: newMsg.author,
                      address: newMsg.author,
                    },
                    createdAt: newMsg.created_at,
                  },
                ];
              }
              return current;
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as DbChatMessage;
            if (updated.deleted_at) {
              // Message was soft deleted
              setMessages((current) => current.filter((msg) => msg.id !== updated.id));
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
      supabaseClient.removeChannel(dbSubscription);
    };
  }, [roomName, supabaseClient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected || !session || !supabaseClient) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      // Save to database
      const dbMessage: ChatInsert = {
        message: messageContent,
        author: userAddress,
      };

      const { data, error } = await supabaseClient.from("chat_messages").insert(dbMessage).select().single();

      if (error) throw error;

      // Update local state immediately with the database response
      if (data) {
        const formattedMessage: ChatMessage = {
          id: data.id,
          content: data.message,
          user: {
            name: username,
            address: data.author,
          },
          createdAt: data.created_at,
        };

        setMessages((current) => [...current, formattedMessage]);

        // Broadcast to other users for immediate update
        await supabaseClient.channel(roomName).send({
          type: "broadcast",
          event: "message",
          payload: formattedMessage,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      // Restore the message in input if sending failed
      setNewMessage(messageContent);
    }
  };

  return (
    <div className={cn("flex flex-col h-[600px] bg-background", className)}>
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.user.address === userAddress;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showHeader = !prevMessage || prevMessage.user.address !== message.user.address;

            return (
              <div key={message.id} className={cn("flex mt-2", isOwnMessage ? "justify-end" : "justify-start")}>
                <div
                  className={cn("max-w-[75%] w-fit flex flex-col gap-1", {
                    "items-end": isOwnMessage,
                  })}
                >
                  {showHeader && (
                    <div
                      className={cn("flex items-center gap-2 text-xs px-3", {
                        "justify-end flex-row-reverse": isOwnMessage,
                      })}
                    >
                      <ChatUserInfo address={message.user.address} avatarClassName="w-5 h-5" nameClassName="text-xs" />
                      <span className="text-foreground/50 text-xs">
                        {new Date(message.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "py-2 px-3 rounded-xl text-sm w-fit",
                      isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="flex w-full gap-2 border-t border-border p-4">
        <Input
          className={cn(
            "rounded-full bg-background text-sm transition-all duration-300",
            isConnected && newMessage.trim() ? "w-[calc(100%-36px)]" : "w-full",
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={session ? "Type a message..." : "Connect wallet to chat"}
          disabled={!isConnected || !session}
        />
        {isConnected && newMessage.trim() && session && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            size="icon"
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
