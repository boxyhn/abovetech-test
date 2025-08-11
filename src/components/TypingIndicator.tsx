import React, { memo } from "react";

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center h-5" aria-live="polite" aria-label="상대방이 입력 중입니다">
      <span className="typing-ball typing-ball-1" aria-hidden="true" />
      <span className="typing-ball typing-ball-2" aria-hidden="true" />
      <span className="typing-ball typing-ball-3" aria-hidden="true" />
    </div>
  );
});

export default TypingIndicator;