import { UserCover } from "@/components/user/UserCover";
import { UserProfile } from "../../../../components/user/UserProfile";

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
	const user = params.user;

	return (
		<div className="flex flex-col gap-4 items-center justify-center w-full max-w-lg lg:max-w-xl">
			<UserCover user={user} />
			<UserProfile user={user} />
		</div>
	);
};

export default user;
