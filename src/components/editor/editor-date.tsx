export const EditorDate = () => {
  const today = new Date();
  const formattedDate = today.toDateString();
  const formattedTime = today.toLocaleTimeString();
  const formattedDateTime = `${formattedDate}`;

  return <div className="tk-plantin text-center text-sm py-2">{formattedDateTime}</div>;
};
