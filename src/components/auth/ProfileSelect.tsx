import {
	Profile,
	useLogin,
	useProfilesManaged,
} from "@lens-protocol/react-web";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";

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

		window.alert(result.error.message);
	};

	return (
		<Button disabled={loading} onClick={login}>
			{profile.handle?.fullHandle ?? profile.id}
		</Button>
	);
}

export function ProfileSelect({ onSuccess }: { onSuccess: (profile: Profile) => void }) {
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
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>{error.message}</p>;
	}

	if (profiles.length === 0) {
		return <p>No profiles managed by this wallet.</p>;
	}

	return (
		<div>
			{profiles.map((profile) => (
				<ProfileLoginButton
					key={profile.id}
					profile={profile}
					onSuccess={onSuccess}
				/>
			))}
		</div>
	);
}
