import { UserProfile } from "@/components/user/UserProfile";
import { getAuthorizedClients } from "@/lib/getAuthorizedClients";
import { notFound } from "next/navigation";

export async function generateMetadata({
	params,
}: { params: { user: string } }) {
	const handle = params.user;
	const title = `${handle}`;
	return {
		title,
		description: `@${handle} on Fountain`,
	};
}

const user = async ({ params }: { params: { user: string } }) => {
	const handle = params.user;

	const { lens } = await getAuthorizedClients();

	const profile = await lens.profile.fetch({ forHandle: `lens/${handle}` });

	if (!profile) {
		return notFound();
	}

	return <UserProfile user={handle} />;
};

export default user;
