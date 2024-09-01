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
	const username = params.user;

	const { lens } = await getAuthorizedClients();

	const profile = await lens.profile.fetch({ forHandle: username });

	if (!profile) {
		return notFound();
	}

	return <UserProfile user={username} />;
};

export default user;
