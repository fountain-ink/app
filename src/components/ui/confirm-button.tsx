import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { LucideIcon } from "lucide-react";

interface ConfirmButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onConfirm: () => void;
  duration?: number;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "ghost2"
    | "ghost3"
    | "ghostText"
    | "brand"
    | "muted"
    | "blockAction"
    | "menuAction"
    | "navAction"
    | "blockActionSecondary"
    | "none";
  icon: LucideIcon;
  children?: React.ReactNode;
}

export function ConfirmButton({
  onConfirm,
  duration = 1500,
  variant = "outline",
  className,
  children,
  disabled,
  icon: Icon,
  ...props
}: ConfirmButtonProps) {
  const [isHolding, setIsHolding] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(Math.ceil(duration / 1000));
  const timeoutRef = React.useRef<number>();
  const startTimeRef = React.useRef<number>();

  const startHolding = React.useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (disabled) return;

      setIsHolding(true);
      startTimeRef.current = Date.now();

      const animate = () => {
        if (!startTimeRef.current) return;

        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        const secondsLeft = Math.ceil((duration - elapsed) / 1000);

        setProgress(newProgress);
        setTimeLeft(secondsLeft);

        if (newProgress < 100) {
          timeoutRef.current = window.requestAnimationFrame(animate);
        } else {
          setIsHolding(false);
          setProgress(0);
          onConfirm();
        }
      };

      timeoutRef.current = window.requestAnimationFrame(animate);
    },
    [duration, disabled, onConfirm],
  );

  const stopHolding = React.useCallback(() => {
    if (timeoutRef.current) {
      window.cancelAnimationFrame(timeoutRef.current);
    }
    startTimeRef.current = undefined;
    setIsHolding(false);
    setProgress(0);
    setTimeLeft(Math.ceil(duration / 1000));
  }, [duration]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.cancelAnimationFrame(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Button
      variant={variant}
      className={cn("relative select-none overflow-hidden", isHolding && "cursor-grabbing", className)}
      onMouseDown={startHolding}
      onMouseUp={stopHolding}
      onMouseLeave={stopHolding}
      onTouchStart={startHolding}
      onTouchEnd={stopHolding}
      disabled={disabled}
      {...props}
    >
      <motion.div
        layout
        className="flex items-center gap-2 relative z-10"
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <div className="relative h-6 w-6 flex-shrink-0">
          <AnimatePresence initial={false} mode="wait">
            {isHolding ? (
              <motion.div
                key="progress"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg className="absolute inset-0" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.circle
                    cx="25"
                    cy="25"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 0, ease: "linear" }}
                  />
                </svg>
                <div className="relative z-10 text-xs font-semibold">{timeLeft}</div>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Icon className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.span layout="position">{children}</motion.span>
      </motion.div>
    </Button>
  );
}
