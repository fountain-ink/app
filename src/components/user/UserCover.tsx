import { Profile } from "@lens-protocol/react-web";

export const UserCover = ({
	profile,
	loading,
}: { profile?: Profile; loading?: boolean }) => {
	if (loading) {
		return <UserCoverSuspense />;
	}

	const cover =
		profile?.metadata?.coverPicture?.optimized ||
		profile?.metadata?.coverPicture?.raw;

	if (!cover) {
		return <div className="w-full h-64 bg-card/50 rounded-b-xl" />;
	}

	return (
		<img
			className="rounded-b-lg"
			src={cover.uri}
			alt={profile?.handle?.localName}
		/>
	);
};

const UserCoverSuspense = () => {
	return <div className="w-full h-48 bg-muted" />;
};
