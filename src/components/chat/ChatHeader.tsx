import { colors } from "@/config/theme";
import ChevronLeftIcon from "../icons/ChevronLeftIcon";
import Image from "next/image";

interface ChatHeaderProps {
  onBack: () => void;
  onReport: () => void;
  // coin: number; // 코인 기능 비활성화
  isReportDisabled?: boolean;
}

export default function ChatHeader({
  onBack,
  onReport,
  // coin, // 코인 기능 비활성화
  isReportDisabled = false,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 h-15 bg-transparent">
      <div className="flex items-center">
        <ChevronLeftIcon color={colors.zendiBlack} size={32} onClick={onBack} />
        <div className="text-body font-bold">호키동자</div>
      </div>
      <div className="flex items-center">
        {/* <ChatHeaderIcon
          icon={
            <Image src="/icons/coin.png" alt="Coin" width={32} height={32} />
          }
          onClick={() => {}}
          label={coin.toLocaleString()}
        /> */}
        <ChatHeaderIcon
          icon={
            <Image
              src="/icons/report.png"
              alt="Report"
              width={32}
              height={32}
              style={isReportDisabled ? { opacity: 0.3 } : undefined}
            />
          }
          onClick={onReport}
          label="레포트"
          disabled={isReportDisabled}
        />
      </div>
    </div>
  );
}

interface ChatHeaderIconProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

const ChatHeaderIcon = ({ icon, onClick, label, disabled = false }: ChatHeaderIconProps) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-label={label}
      className={`flex flex-col items-center h-11 w-11 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      disabled={disabled}
    >
      {icon}
      <div className={`text-label ${disabled ? 'text-gray-400' : 'text-zendi-black'}`}>{label}</div>
    </button>
  );
};
