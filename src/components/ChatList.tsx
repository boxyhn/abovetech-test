"use client";

import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isUser: boolean;
}

interface ChatListProps {
  messages: Message[];
  isTyping?: boolean;
}

export default function ChatList({ messages, isTyping }: ChatListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 my-2" role="log" aria-label="채팅 메시지 목록">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message.text}
          timestamp={message.timestamp}
          isUser={message.isUser}
        />
      ))}

      {isTyping && (
        <ChatMessage
          message="생각 중"
          timestamp="오후 2:21"
          isUser={false}
          isTyping={true}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
