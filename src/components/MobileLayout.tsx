import React from "react";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[375px] min-h-screen shadow-left-right combined-gradient-bg">
      {children}
    </div>
  );
}
