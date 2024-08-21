import { LogoutButton } from "@/components/auth/LogoutButton";

export async function generateMetadata() {
	const title = "Settings";
	return {
		title,
	};
}

const settings = async () => {
	return (
		<div className="w-full flex items-center justify-center p-8">
			<LogoutButton />
		</div>
	);
};

export default settings;
