import { UserDrafts } from "@/components/user/UserDrafts";
import { getAuthorizedClients } from "@/lib/getAuthorizedClients";

const UserPage = async ({ params }: { params: { user: string } }) => {
	const { lens } = await getAuthorizedClients();
	const pageHandle = `lens/${params.user}`;
	const profile = await lens.profile.fetch({ forHandle: pageHandle });

	if (!profile) {
		return null;
	}

	return <UserDrafts />;
};

export default UserPage;
