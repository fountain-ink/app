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
  onClick?: () => void;
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
      variant="ghost"
      {...buttonProps}
      className={`${buttonProps.className} justify-center group p-0 h-10 w-10 mx-0`}
    >
      <Icon className="w-full h-full p-0 px-0 py-0" animate={isHovered} />
      {children && <span>{children}</span>}
    </Button>
  ) : (
    <DropdownMenuItem
      {...buttonProps}
      className={`${buttonProps.className} transition-all duration-300 w-full group px-0 h-10 mx-0`}
    >
      <Icon animate={isHovered} />
      {children && <span>{children}</span>}
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
