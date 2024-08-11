import { Profile } from "@lens-protocol/react-web";
import { UserAvatar } from "./UserAvatar";

export const UserAuthorView = ({
	profile,
	showAvatar = true,
	showName = true,
	showHandle = true,
}: {
	profile: Profile;
	showAvatar?: boolean;
	showName?: boolean;
	showHandle?: boolean;
}) => {
	const name = profile?.metadata?.displayName;
	const handle = profile?.handle?.localName;

	return (
		<span className="flex flex-row gap-2">
			{showAvatar && <UserAvatar className="w-6 h-6" profile={profile} />}
			{showName && <b className="text-foreground">{name}</b>}
			{showHandle && <span className="text-foreground">@{handle}</span>}
		</span>
	);
};
