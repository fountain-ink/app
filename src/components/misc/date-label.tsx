import { formatTime } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InfoIcon } from "lucide-react";

export const DateLabel = ({ date, originalDate }: { date: string; originalDate?: string }) => {
  const actualDateToFormat = date ? new Date(date) : new Date();
  const formattedActualDate = actualDateToFormat.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (originalDate) {
    const originalDateToFormat = new Date(originalDate);
    const formattedOriginalDate = originalDateToFormat.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className="font-[family-name:--title-font] flex flex-row gap-2 items-center justify-center cursor-help">
            <span className="font-semibold">{formattedOriginalDate}</span>
            <InfoIcon className="w-3 h-3 text-muted-foreground" />
          </span>
        </PopoverTrigger>
        <PopoverContent className="text-sm w-auto gap-2 flex flex-col p-4">
          <p>
            Published on <span className="font-semibold text-muted-foreground">{formattedActualDate}</span>
          </p>
          <p>
            Originally published on <span className="font-semibold text-muted-foreground">{formattedOriginalDate}</span>
          </p>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <span className="font-[family-name:--title-font]">
      <span className="font-semibold">{formattedActualDate}</span>
    </span>
  );
};

export const PastDateLabel = ({ updatedAt }: { updatedAt: string }) => {
  const formattedDate = formatTime(updatedAt);

  return <div className="font-[family-name:--date-font] text-sm">Last modified {formattedDate}</div>;
};
