import { UserContent } from "@/components/user/user-content";
import { UserNavigation } from "@/components/user/user-navigation";
import { getAuthorizedClients } from "@/lib/get-auth-clients";

const UserPage = async ({ params }: { params: { user: string } }) => {
	const { lens } = await getAuthorizedClients();
	const pageHandle = `lens/${params.user}`;
	const profile = await lens.profile.fetch({ forHandle: pageHandle });

	if (!profile) {
		return null;
	}

	return (
		<>
			<UserContent contentType="articles" profile={profile} />
		</>
	);
};

export default UserPage;
