import * as React from "react";

interface ChevronLeftIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number;
}

const ChevronLeftIcon = ({ color = "#161741", size = 32, ...props }: ChevronLeftIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7.667 22.665 1 16l6.667-6.667"
    />
  </svg>
);

export default ChevronLeftIcon;
