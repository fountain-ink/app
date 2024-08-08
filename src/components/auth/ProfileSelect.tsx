import { Profile, useLogin, useProfilesManaged } from "@lens-protocol/react-web";
import { Button } from "../ui/button";
import { useAccount } from "wagmi";

export type LoginAsProps = {
  profile: Profile;
  onSuccess: (profile: Profile) => void;
};

export function LoginAs({ profile, onSuccess }: LoginAsProps) {
  const { execute, loading } = useLogin();
  const { address, isConnecting, isDisconnected } = useAccount();

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

type LoginOptionsProps = {
  wallet: string;
  onSuccess: (profile: Profile) => void;
};

export function ProfileSelect({ wallet, onSuccess }: LoginOptionsProps) {
  const { data: profiles, error, loading } = useProfilesManaged({
    for: wallet,
    includeOwned: true
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
        <LoginAs key={profile.id} profile={profile} onSuccess={onSuccess} />
      ))}
    </div>
  );
}