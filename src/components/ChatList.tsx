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
  typingMessage?: string;
}

export default function ChatList({ messages, typingMessage }: ChatListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingMessage]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 mt-2"
      role="log"
      aria-label="채팅 메시지 목록"
    >
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message.text}
          timestamp={message.timestamp}
          isUser={message.isUser}
        />
      ))}

      {typingMessage && (
        <ChatMessage
          message={typingMessage}
          timestamp={new Date().toLocaleTimeString("ko-KR", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
          isUser={false}
          isTyping={true}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
