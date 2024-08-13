import {
	Profile,
	useLogin,
	useProfilesManaged,
} from "@lens-protocol/react-web";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function ProfileLoginButton({
	profile,
	onSuccess,
}: { profile: Profile; onSuccess: (profile: Profile) => void }) {
	const { execute, loading } = useLogin();
	const { address } = useAccount();

	const login = async () => {
		if (!address) {
			return;
		}
		const result = await execute({
			address,
			profileId: profile.id,
		});

		if (result.isSuccess()) {
			return onSuccess(profile);
		}

		toast.error(result.error.message);
	};

	const avatar =
		profile?.metadata?.picture?.__typename === "ImageSet"
			? profile?.metadata?.picture?.optimized?.uri ||
			  profile?.metadata?.picture?.raw?.uri
			: profile?.metadata?.picture?.image.optimized?.uri ||
			  profile?.metadata?.picture?.image.raw?.uri;

	return (
		<Button
			variant="ghost"
			size="lg"
			className="flex items-center gap-2"
			disabled={loading}
			onClick={login}
		>
			{avatar && (
				<img
					src={avatar}
					alt={profile.handle?.localName}
					className="w-6 h-6 rounded-full"
				/>
			)}
			{profile.handle?.localName ?? profile.id}
		</Button>
	);
}

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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Select profile</DialogTitle>
				</DialogHeader>
				{/* // TODO onboarding */}
				{profiles.length === 0 &&  <p>No profiles managed by this wallet.</p> }
				{profiles.map((profile) => (
					<ProfileLoginButton
						key={profile.id}
						profile={profile}
						onSuccess={onSuccess}
					/>
				))}
			</DialogContent>
		</Dialog>
	);
}
