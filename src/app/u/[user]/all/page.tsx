import { UserContent } from "@/components/user/user-content";
import { getAuthorizedClients } from "@/lib/getAuthorizedClients";

const UserPage = async ({ params }: { params: { user: string } }) => {
	const { lens } = await getAuthorizedClients();
	const pageHandle = `lens/${params.user}`;
	const profile = await lens.profile.fetch({ forHandle: pageHandle });

	if (!profile) {
		return null;
	}

	return <UserContent contentType="all" profile={profile} />;
};

export default UserPage;
