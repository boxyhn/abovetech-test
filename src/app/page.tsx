"use client";

import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";

export default function Home() {
  return (
    <div className="chat-input-bg">
      <ChatHeader />
      <ChatInput onSendMessage={() => {}} />
    </div>
  );
}
