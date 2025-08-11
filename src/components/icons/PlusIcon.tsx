import * as React from "react";

interface PlusIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number;
}

const PlusIcon = ({
  color = "#5791FF",
  size = 16,
  ...props
}: PlusIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 2.343v11.314M2.343 8h11.314"
    />
  </svg>
);

export default PlusIcon;
