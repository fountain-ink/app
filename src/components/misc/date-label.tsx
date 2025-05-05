import { formatTime } from "@/lib/utils";

export const DateLabel = ({ date }: { date: string }) => {
  const dateToFormat = date ? new Date(date) : new Date();
  const formattedDate = dateToFormat.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedDateTime = `${formattedDate}`;

  return <div className="tk-plantin text-center text-sm text-primary/50">{formattedDateTime}</div>;
};

export const PastDateLabel = ({ updatedAt }: { updatedAt: string }) => {
  const formattedDate = formatTime(updatedAt);

  return <div className="font-[family-name:--date-font] text-sm">Last modified {formattedDate}</div>;
};
