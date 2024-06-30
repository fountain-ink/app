export const EditorDate = () => {
	const today = new Date();
	const formattedDate = today.toDateString();
	const formattedTime = today.toLocaleTimeString();
	const formattedDateTime = `${formattedDate}`;

	return <div className="font-mono text-sm">{formattedDateTime}</div>;
};
