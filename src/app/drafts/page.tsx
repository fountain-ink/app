import { LogoutButton } from "@/components/auth/LogoutButton";

export async function generateMetadata() {
	const title = "Settings";
	return {
		title,
	};
}

const settings = async () => {
	const drafts = fetch("/api/drafts", {
		method: "GET",
		headers: {
			// Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	return (
		<div className="w-full flex items-center justify-center p-8">
			<LogoutButton />
		</div>
	);
};

export default settings;
