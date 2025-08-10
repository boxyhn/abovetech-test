import React from "react";
import TypingIndicator from "./TypingIndicator";

interface ChatMessageProps {
  message: string;
  timestamp: string;
  isUser: boolean;
  isTyping?: boolean;
}

export default function ChatMessage({
  message,
  timestamp,
  isUser,
  isTyping,
}: ChatMessageProps) {
  const messageAlignClass = isUser ? "justify-end" : "justify-start mb-2.5";
  const messageFlexClass = isUser ? "flex-row-reverse" : "flex-row";
  const messageMarginClass = isUser ? "ml-7" : "mr-7";
  const messageBubbleClass = isUser
    ? "message-bubble-user"
    : "message-bubble-other";

  return (
    <div className={`flex ${messageAlignClass}`}>
      <div
        className={`flex ${messageFlexClass} items-end gap-2 ${messageMarginClass}`}
      >
        <div className="flex flex-col gap-1">
          {!isUser && (
            <div className="flex items-center gap-1.5 drop-shadow-other-profile">
              <div className="avatar-small bg-[#A6C3FA]" />
              <span className="text-label font-bold">호키동자</span>
            </div>
          )}

          <div
            className={`message-bubble ${messageBubbleClass}`}
          >
            {isTyping ? (
              <>
                <p className="whitespace-pre-wrap text-body text-zendi-blue font-bold">
                  {message}
                </p>
                <TypingIndicator />
              </>
            ) : (
              <p className="whitespace-pre-wrap text-body">
                {message}
              </p>
            )}
          </div>
        </div>

        <span className="text-caption text-zendi-gray shrink-0">
          {timestamp}
        </span>
      </div>
    </div>
  );
}
