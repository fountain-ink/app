"use client";

import { Button } from "@/components/ui/button";
import { usePublishStore } from "@/hooks/use-publish-store";

export const PublishMenu = () => {
  const setIsOpen = usePublishStore((state) => state.setIsOpen);

  return <Button onClick={() => setIsOpen(true)}>Publish</Button>;
};
