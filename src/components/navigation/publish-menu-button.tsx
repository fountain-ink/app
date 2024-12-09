"use client";

import { Button } from "@/components/ui/button";
import { usePublishStore } from "@/hooks/use-publish-store";

export const PublishMenu = () => {
  const [setIsOpen, isOpen] = usePublishStore((state) => [state.setIsOpen, state.isOpen]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Button className="trasition-all duration-300" variant={isOpen ? "outline" : "default"} onClick={handleClick}>
      {isOpen ? "Edit" : "Preview"}
    </Button>
  );
};
