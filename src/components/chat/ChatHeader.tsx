import { colors } from "@/config/theme";
import ChevronLeftIcon from "../icons/ChevronLeftIcon";
import Image from "next/image";

interface ChatHeaderProps {
  onBack: () => void;
  onReport: () => void;
  coin: number;
}

export default function ChatHeader({
  onBack,
  onReport,
  coin,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 h-15 bg-transparent">
      <div className="flex items-center">
        <ChevronLeftIcon color={colors.zendiBlack} size={32} onClick={onBack} />
        <div className="text-body font-bold">호키동자</div>
      </div>
      <div className="flex items-center">
        <ChatHeaderIcon
          icon={
            <Image src="/icons/coin.png" alt="Coin" width={32} height={32} />
          }
          onClick={() => {}}
          label={coin.toLocaleString()}
        />
        <ChatHeaderIcon
          icon={
            <Image
              src="/icons/report.png"
              alt="Report"
              width={32}
              height={32}
            />
          }
          onClick={onReport}
          label="레포트"
        />
      </div>
    </div>
  );
}

interface ChatHeaderIconProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}

const ChatHeaderIcon = ({ icon, onClick, label }: ChatHeaderIconProps) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center h-11 w-11"
    >
      {icon}
      <div className="text-label text-zendi-black">{label}</div>
    </button>
  );
};
