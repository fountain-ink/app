import { LogoutButton } from "@/components/auth/LogoutButton";
import SettingsPage from "@/components/settings/SettingsPage";

export async function generateMetadata() {
	const title = "Settings";
	return {
		title,
	};
}

const settings = async () => {
	return (
		<div className="w-full flex items-center justify-center p-8">
  		<SettingsPage />
		</div>
	);
};

export default settings;
