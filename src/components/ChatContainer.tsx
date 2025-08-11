"use client";

import React, { useState, useEffect } from "react";
import ChatList, { Message } from "./ChatList";
import ChatInput from "./chat/ChatInput";
import ChatHeader from "./chat/ChatHeader";
import { generateMessageId } from "@/utils/idGenerator";
import { validateMessage, processMessage } from "@/utils/messageValidation";
import { ApiClient } from "@/lib/api";

type ChatState =
  | "INITIALIZING"      // 세션 초기화 중
  | "IDLE"              // 대기 중 (메시지 전송 가능)
  | "WAITING_RESPONSE"  // 응답 대기 중
  | "ANALYZING";        // 사주 분석 중

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatState, setChatState] = useState<ChatState>("INITIALIZING");

  // 세션 초기화
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await ApiClient.createSession();
        setSessionId(response.session_id);

        // 첫 인사말 추가
        const initialMessage: Message = {
          id: generateMessageId(),
          text: response.initial_message,
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          isUser: false,
        };
        setMessages([initialMessage]);
        setChatState("IDLE");
      } catch (error) {
        console.error("Failed to create session:", error);
      }
    };

    initializeSession();
  }, []);

  const handleSendMessage = async (text: string) => {
    // 응답 대기 중이거나 분석 중이면 전송 방지
    if (chatState === "WAITING_RESPONSE" || chatState === "ANALYZING") {
      return;
    }

    // Validate message
    const validation = validateMessage(text);
    if (!validation.isValid) {
      return;
    }

    if (!sessionId) {
      console.error("No session ID available");
      return;
    }

    // Process and sanitize message
    const processedText = processMessage(text);

    // 사용자 메시지 즉시 표시
    const userMessage: Message = {
      id: generateMessageId(),
      text: processedText,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);

    // 응답 대기 상태로 변경
    setChatState("WAITING_RESPONSE");

    try {
      // API 호출
      const response = await ApiClient.sendMessage({
        session_id: sessionId,
        message: processedText,
      });

      // 상태 업데이트
      if (response.status === "ANALYZING") {
        setChatState("ANALYZING");
      } else {
        // 응답 받았으면 IDLE 상태로
        setChatState("IDLE");
      }

      // 봇 응답 추가
      const botMessage: Message = {
        id: generateMessageId(),
        text: response.response,
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);

      // ANALYZING 상태일 때 폴링 시작
      if (response.status === "ANALYZING") {
        startPollingForAnalysis();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // 에러 메시지 표시
      const errorMessage: Message = {
        id: generateMessageId(),
        text: "메시지 전송에 실패했습니다. 다시 시도해주세요.",
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
      // 에러 시 IDLE 상태로 복원
      setChatState("IDLE");
    }
  };

  // 분석 완료 폴링
  const startPollingForAnalysis = () => {
    const checkInterval = setInterval(async () => {
      if (!sessionId) return;

      try {
        // 세션 상태 확인 API 호출
        const response = await ApiClient.getSessionStatus(sessionId);

        if (response.status !== "ANALYZING") {
          clearInterval(checkInterval);
          setChatState("IDLE");

          // 분석 완료 메시지가 있으면 추가
          if (
            response.latestMessage &&
            !messages.some((m) => m.text === response.latestMessage)
          ) {
            const readyMessage: Message = {
              id: generateMessageId(),
              text: response.latestMessage,
              timestamp: new Date().toLocaleTimeString("ko-KR", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              isUser: false,
            };
            setMessages((prev) => [...prev, readyMessage]);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        clearInterval(checkInterval);
      }
    }, 3000); // 3초마다 확인
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        onBack={() => {}} // TODO: 뒤로가기 핸들러 구현
        onReport={() => {}} // TODO: 신고 핸들러 구현
        coin={24500}
      />
      {chatState === "INITIALIZING" ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zendi-black30">세션을 초기화하는 중...</div>
        </div>
      ) : (
        <>
          <ChatList
            messages={messages}
            typingMessage={
              chatState === "ANALYZING"
                ? "분석 중"
                : chatState === "WAITING_RESPONSE"
                ? "생각 중"
                : undefined
            }
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={
              chatState === "WAITING_RESPONSE" || chatState === "ANALYZING"
            }
          />
        </>
      )}
    </div>
  );
}
