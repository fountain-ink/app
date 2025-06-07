import { Metadata } from "next"
import { RealtimeChat } from "@/components/chat/realtime-chat"
import { getSession } from "@/lib/auth/get-session"

export const metadata: Metadata = {
  title: "Chat | Fountain",
  description: "Real-time chat",
}

export default async function ChatPage() {
  const session = await getSession()

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Chat</h1>
      <RealtimeChat roomName="general" session={session} />
    </div>
  )
}