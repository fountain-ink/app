import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";

export const AnimatedMenuItem = ({
  href,
  onClick,
  icon: Icon,
  children,
  asButton = false,
}: {
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  icon: React.ComponentType<{ animate?: boolean; className?: string }>;
  children?: React.ReactNode;
  asButton?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonProps = {
    onClick,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: "flex justify-start gap-2 items-center text-base",
  };

  const content = asButton ? (
    <Button
      variant="outline"
      size="icon"
      {...buttonProps}
      className={`${buttonProps.className} transition-all duration-300 justify-center group `}
    >
      <Icon animate={isHovered} className="w-5 h-5" />
      {children && <span>{children}</span>}
    </Button>
  ) : (
    <DropdownMenuItem
      {...buttonProps}
      className={`${buttonProps.className} transition-all duration-300 w-full group px-0 h-10 mx-0`}
    >
      <div className="p-2">
        <Icon animate={isHovered} className="w-5 h-5" />
      </div>
      {children && <span>{children}</span>}
    </DropdownMenuItem>
  );

  if (href) {
    return (
      <Link href={href} passHref prefetch>
        {content}
      </Link>
    );
  }

  return content;
};
