import { LoaderCircleIcon } from "lucide-react";

export const LoadingSpinner = ({ size = 22, className }: { size?: number; className?: string }) => {
  return (
    <div className={className}>
      <LoaderCircleIcon size={size} className="animate-spin justify-center items-center" />
    </div>
  );
};