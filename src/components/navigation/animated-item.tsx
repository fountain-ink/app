import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";

export const AnimatedMenuItem = ({
  href,
  onClick,
  icon: Icon,
  children,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ animate?: boolean }>;
  children: React.ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <DropdownMenuItem
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex justify-start gap-2 items-center text-base group px-0 h-10 mx-0"
    >
      <Icon animate={isHovered} />
      <span>{children}</span>
    </DropdownMenuItem>
  );

  if (href) {
    return (
      <Link href={href} passHref>
        {content}
      </Link>
    );
  }

  return content;
};
