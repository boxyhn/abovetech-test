"use client";

import React, { useState } from "react";
import ChatList, { Message } from "./ChatList";
import ChatInput from "./chat/ChatInput";
import ChatHeader from "./chat/ChatHeader";
import { generateMessageId } from "@/utils/idGenerator";
import { validateMessage, processMessage } from "@/utils/messageValidation";

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
    // Validate message
    const validation = validateMessage(text);
    if (!validation.isValid) {
      // TODO: Show error message to user
      return;
    }
    
    // Process and sanitize message
    const processedText = processMessage(text);
    
    const newMessage: Message = {
      id: generateMessageId(),
      text: processedText,
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
        id: generateMessageId(),
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
        onBack={() => {}} // TODO: 뒤로가기 핸들러 구현
        onReport={() => {}} // TODO: 신고 핸들러 구현
        coin={24500}
      />
      {/* TODO: 실제 타이핑 상태 연동 예정. 현재는 데모용으로 true 설정 */}
      <ChatList messages={messages} isTyping={true} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
