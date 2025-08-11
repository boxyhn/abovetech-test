import React, { memo } from "react";
import TypingIndicator from "./TypingIndicator";

interface ChatMessageProps {
  message: string;
  timestamp: string;
  isUser: boolean;
  isTyping?: boolean;
}

const ChatMessage = memo(function ChatMessage({
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
    <article 
      className={`flex ${messageAlignClass}`}
      aria-label={isUser ? "내 메시지" : "호키동자 메시지"}
    >
      <div
        className={`flex ${messageFlexClass} items-end gap-2 ${messageMarginClass}`}
      >
        <div className="flex flex-col gap-1">
          {!isUser && (
            <div className="flex items-center gap-1.5 drop-shadow-other-profile">
              <div className="avatar-small bg-[#A6C3FA]" role="img" aria-label="호키동자 프로필" />
              <span className="text-label font-bold">호키동자</span>
            </div>
          )}

          <div
            className={`message-bubble ${messageBubbleClass}`}
            role={isTyping ? "status" : "text"}
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

        <time className="text-caption text-zendi-gray shrink-0" dateTime={timestamp}>
          {timestamp}
        </time>
      </div>
    </article>
  );
});

export default ChatMessage;
