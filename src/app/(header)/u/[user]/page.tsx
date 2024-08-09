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
		<div className="w-full flex items-center justify-center">
			<div className="flex flex-col gap-4 max-w-[70%]">
				<UserProfile user={user} />
			</div>
		</div>
	);
};

export default user;
