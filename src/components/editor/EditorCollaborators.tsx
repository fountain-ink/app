export const EditorCollaborators = () => {
	const placeholderUser = (
		<div className="flex flex-row gap-2 items-center">
			<div className="rounded-full bg-gray-300 w-8 h-8" />
			<div className="rounded-full text-sm p-1 px-2 flex gap-2 items-center">
				<b>My name</b>
				@username
			</div>
		</div>
	);

	return (
		<div className="flex flex-row gap-4 items-center p-2">
			{placeholderUser}
		</div>
	);
};
