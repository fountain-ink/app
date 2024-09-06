import { type Profile, useProfilesManaged } from "@lens-protocol/react-web";
import { PlusIcon, User2Icon } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { LoginButton } from "./login-button";

export function ProfileSelect({
	onSuccess,
}: { onSuccess: (profile: Profile) => void }) {
	const { address } = useAccount();
	const {
		data: profiles,
		error,
		loading,
	} = useProfilesManaged({
		for: address || "",
		includeOwned: true,
	});

	if (loading) {
		return null;
	}

	if (error) {
		toast.error(error.message);
		return null;
	}

	return (
		<Dialog defaultOpen>
			<DialogTrigger asChild>
				<Button size="icon" variant="ghost">
					<User2Icon />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-72">
				<DialogHeader>
					<DialogTitle>Select profile</DialogTitle>
				</DialogHeader>
				{/* // TODO onboarding */}
				{profiles.length === 0 && <p>No profiles found.</p>}
				{profiles.map((profile) => (
					<LoginButton
						key={profile.id}
						profile={profile}
						onSuccess={onSuccess}
					/>
				))}
				<Button
					variant="ghost"
					className="flex gap-2 text-md"
					onClick={() => toast.error("Not implemented yet")}
				>
					<PlusIcon />
					New Profile
				</Button>
			</DialogContent>
		</Dialog>
	);
}
