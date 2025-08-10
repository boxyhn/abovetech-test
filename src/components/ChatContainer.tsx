"use client";

import React, { useState } from "react";
import ChatList, { Message } from "./ChatList";
import ChatInput from "./chat/ChatInput";
import ChatHeader from "./chat/ChatHeader";

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕! 내가 해준 상담이 마음에 들었어?\n추가로 궁금한 점이 있으면 무엇이든 물어봐.\n상담을 해쳤던 내용을 바탕으로 고민을 더 심도있게 다뤄볼게!",
      timestamp: "오후 2:21",
      isUser: false,
    },
    {
      id: "2",
      text: "나는 내 미래 남자친구가 궁금해.\n언제 어디서 만날 수 있을 지 자세히 설명해봐.",
      timestamp: "오후 2:21",
      isUser: true,
    },
    {
      id: "3",
      text: "안녕! 내가 해준 상담이 마음에 들었어?\n추가로 궁금한 점이 있으면 무엇이든 물어봐.\n상담을 해쳤던 내용을 바탕으로 고민을 더 심도있게 다뤄볼게!",
      timestamp: "오후 2:21",
      isUser: false,
    },
    {
      id: "4",
      text: "나는 내 미래 남자친구가 궁금해.\n언제 어디서 만날 수 있을 지 자세히 설명해봐.",
      timestamp: "오후 2:21",
      isUser: true,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      isUser: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    // 타이핑 인디케이터 시뮬레이션
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "메시지를 받았습니다. 곧 답변드리겠습니다.",
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        onBack={() => console.log("Go back")}
        onReport={() => console.log("Report")}
        coin={24500}
      />
      <ChatList messages={messages} isTyping={true} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
