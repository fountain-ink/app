"use client";

import { Button } from "@/components/ui/button";
import { usePublishStore } from "@/hooks/use-publish-store";
import { usePathname, useRouter } from "next/navigation";

export const PublishMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isPreview = pathname.includes("/preview");
  const pathParts = pathname.split("/");
  const documentId = pathParts[pathParts.indexOf("write") + 1];
  const setIsOpen = usePublishStore((state) => state.setIsOpen);

  const handleClick = () => {
    if (isPreview) {
      router.push(`/write/${documentId}`);
    } else {
      router.push(`/write/${documentId}/preview`);
    }
  };

  return (
    <>
      {isPreview ? (
        <>
          <Button variant={"outline"} onClick={handleClick}>
            Edit
          </Button>
          <Button onClick={() => setIsOpen(true)}>Publish</Button>
        </>
      ) : (
        <Button onClick={handleClick}>Preview</Button>
      )}
    </>
  );
};

export const PublishMenuButton = () => {
  const setIsOpen = usePublishStore((state) => state.setIsOpen);

  return <Button onClick={() => setIsOpen(true)}>Publish</Button>;
};
