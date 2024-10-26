import { formatTime } from "@/lib/utils";

export const DateLabel = () => {
  const today = new Date();
  const formattedDate = today.toDateString();
  const formattedTime = today.toLocaleTimeString();
  const formattedDateTime = `${formattedDate}`;

  return <div className="tk-plantin text-center text-sm py-2">{formattedDateTime}</div>;
};

export const PastDateLabel = ({ updatedAt }: { updatedAt: string }) => {
  const formattedDate = formatTime(updatedAt);

  return <div className="tk-proxima-nova-wide text-sm">Last modified {formattedDate}</div>;
};
