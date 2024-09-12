"use client";

import { useState } from "react";

export function usePublishDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    onOpenChange: (open: boolean) => setIsOpen(open),
  };
}
