import { formatTime } from "@/lib/utils";

export const DateLabel = () => {
  const today = new Date();
  const formattedDate = today.toDateString();
  const _formattedTime = today.toLocaleTimeString();
  const formattedDateTime = `${formattedDate}`;

  return <div className="tk-plantin text-center text-sm py-2">{formattedDateTime}</div>;
};

export const PastDateLabel = ({ updatedAt }: { updatedAt: string }) => {
  const formattedDate = formatTime(updatedAt);

  return <div className="font-[family-name:--date-font] text-sm">Last modified {formattedDate}</div>;
};
