"use client";

import { MeResult } from "@lens-protocol/client";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RealtimeChat } from "./realtime-chat";

interface EmbeddableRealtimeChatProps {
  position?: "bottom-right" | "bottom-left";
  roomName?: string;
  session: MeResult | null;
}

export function EmbeddableRealtimeChat({
  position = "bottom-right",
  roomName = "general",
  session,
}: EmbeddableRealtimeChatProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn("fixed bottom-4 shadow-lg z-50", position === "bottom-right" ? "right-4" : "left-4")}
          size="icon"
          variant="default"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
      {isOpen && (
        <div className={cn("fixed bottom-4 w-96 shadow-xl z-50", position === "bottom-right" ? "right-4" : "left-4")}>
          <div className="bg-background rounded-lg border">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Chat</h3>
              <Button onClick={() => setIsOpen(false)} size="icon" variant="ghost" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <RealtimeChat roomName={roomName} session={session} className="h-[500px] rounded-b-lg" />
          </div>
        </div>
      )}
    </>
  );
}
