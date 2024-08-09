import { Profile, SessionType, useSession } from "@lens-protocol/react-web";

export const UserHandle = ({ profile, }: { profile?: Profile}) => {
	const handle = profile?.handle?.localName;
	if (!handle) {
		return null;
	}

	return <div className="text-foreground text-lg">@{handle}</div>;
};
