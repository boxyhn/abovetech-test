import React from "react";

export default function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center h-5">
      <span className="typing-ball typing-ball-1" />
      <span className="typing-ball typing-ball-2" />
      <span className="typing-ball typing-ball-3" />
    </div>
  );
}