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
	return (
		<div className="flex flex-col items-center justify-center w-full max-w-lg lg:max-w-xl">
			<UserProfile user={params.user} />
		</div>
	);
};

export default user;
