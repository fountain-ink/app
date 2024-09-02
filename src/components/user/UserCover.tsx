import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";

export const UserCover = ({
	profile,
	loading,
}: { profile?: Profile | ProfileFragment; loading?: boolean }) => {
	if (loading) {
		return <UserCoverSuspense />;
	}

	const cover =
		profile?.metadata?.coverPicture?.optimized ||
		profile?.metadata?.coverPicture?.raw;

	if (!cover) {
		return <div className="w-full h-64 bg-card/20 rounded-b-xl" />;
	}

	return (
		<div className="w-full h-64 overflow-hidden rounded-b-lg">
			<img
				className="w-full h-full object-cover"
				src={cover.uri}
				alt={profile?.handle?.localName}
			/>
		</div>
	);
};

const UserCoverSuspense = () => {
	return <div className="w-full h-48 bg-muted" />;
};
