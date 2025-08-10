"use client";

import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <ChatHeader onBack={() => {}} onReport={() => {}} coin={24500} />
      <ChatInput onSendMessage={() => {}} />
    </div>
  );
}
