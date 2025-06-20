"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Hide on search page
  if (pathname === "/search") {
    return null;
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  if (!isMobile) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
        <motion.div
          initial={false}
          animate={{ width: isFocused ? 280 : 200 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "pl-10 h-9 bg-secondary/15 border-secondary/30 text-foreground placeholder:text-foreground/60 transition-colors",
              isFocused && "border-foreground/20 bg-secondary/20",
            )}
          />
        </motion.div>
      </form>
    );
  }

  return (
    <div className="relative flex items-center">
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {isOpen && (
          <motion.form
            initial={{ opacity: 0, width: "100vw" }}
            animate={{ opacity: 1, width: "100vw" }}
            exit={{ opacity: 0, width: "100vw" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onSubmit={handleSubmit}
            className="fixed inset-x-0 top-0 z-50 h-[58px] bg-background pl-2 pr-4 border-b flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-9 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleClose();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Close search"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
