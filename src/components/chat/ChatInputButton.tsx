import { ButtonHTMLAttributes, ReactNode } from "react";

interface ChatInputButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "icon" | "send";
}

export default function ChatInputButton({ 
  children, 
  variant = "icon",
  className = "",
  ...props 
}: ChatInputButtonProps) {
  const baseClasses = variant === "icon" 
    ? "p-1 transition-opacity"
    : "rounded-full px-3 py-1.5 transition-colors";
    
  return (
    <button
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}