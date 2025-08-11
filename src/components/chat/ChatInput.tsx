"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import SendIcon from "../icons/SendIcon";
import PlusIcon from "../icons/PlusIcon";
import ChatInputButton from "./ChatInputButton";
import { colors } from "@/config/theme";

// Constants
const MAX_TEXTAREA_HEIGHT = 96;
const MIN_TEXTAREA_HEIGHT = 24;
const LINE_HEIGHT = 1.5;
const ICON_SIZE = {
  plus: 20,
  send: 16,
};

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [message]);

  const isMessageEmpty = message.trim() === "";

  const handleSend = useCallback(() => {
    if (!isMessageEmpty) {
      onSendMessage(message);
      setMessage("");
    }
  }, [isMessageEmpty, message, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handlePlusClick = useCallback(() => {
    // TODO: 파일 첨부 기능 구현
  }, []);

  // Styles
  const wrapperClasses =
    "fixed bottom-0 left-0 right-0 p-2.5 drop-shadow-custom";
  const backgroundClasses =
    "absolute inset-0 chat-input-bg rounded-t-xl border border-white/20 -z-10";
  const containerClasses =
    "relative flex items-center justify-between rounded-3xl border border-off-white bg-transparent py-2 w-full drop-shadow-custom pl-3 pr-4 gap-2";
  const textareaClasses =
    "flex-1 outline-none text-body bg-transparent resize-none overflow-y-auto py-1";

  return (
    <>
      {/* Input 영역 밑으로 화면이 내려가지 않도록 빈 공간 추가 */}
      <div className="h-[70px]" />

      <div className={wrapperClasses}>
        {/* Background layer */}
        <div className={backgroundClasses} />

        {/* Content layer */}
        <div className={containerClasses}>
          <div className="flex items-center gap-2 w-full">
            <ChatInputButton
              onClick={handlePlusClick}
              aria-label="Add attachment"
              variant="icon"
              disabled={!isMessageEmpty}
            >
              <PlusIcon
                color={isMessageEmpty ? colors.zendiBlue : colors.zendiBlack30}
                size={ICON_SIZE.plus}
              />
            </ChatInputButton>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="호키에게 메세지를 보내보세요"
              className={textareaClasses}
              rows={1}
              style={{
                lineHeight: `${LINE_HEIGHT}`,
                minHeight: `${MIN_TEXTAREA_HEIGHT}px`,
                maxHeight: `${MAX_TEXTAREA_HEIGHT}px`,
              }}
            />
          </div>

          <ChatInputButton
            onClick={handleSend}
            variant="send"
            className={!isMessageEmpty ? "bg-zendi-blue" : ""}
            disabled={isMessageEmpty}
            aria-label="Send message"
          >
            <SendIcon
              color={!isMessageEmpty ? "white" : colors.zendiBlack30}
              size={ICON_SIZE.send}
            />
          </ChatInputButton>
        </div>
      </div>
    </>
  );
}
