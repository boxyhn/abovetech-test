import * as React from "react";

interface SendIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number;
}

const SendIcon = ({
  color = "#B9B9C6",
  size = 20,
  ...props
}: SendIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <g fill={color} clipPath="url(#a)">
      <path d="M18.003.723a1.002 1.002 0 0 1 1.274 1.274l-5.833 16.667a1.001 1.001 0 0 1-1.857.076l-3.179-7.15-7.147-3.176a1 1 0 0 1 .076-1.857L18.003.723ZM4.377 7.61l5.196 2.31.083.04c.188.106.337.27.425.468l2.309 5.194 4.313-12.325L4.377 7.61Z" />
      <path d="m17.5 2.5-5 15-2.65-6.8L4 7.5l13.5-5Z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default SendIcon;
