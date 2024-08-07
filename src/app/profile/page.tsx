"use client";

import { useProfile } from "@lens-protocol/react-web";
import { useProfilesManaged } from '@lens-protocol/react-web';
import { Profile, useLogin } from '@lens-protocol/react-web';

export type LoginAsProps = {
  profile: Profile;
  wallet: string;
  onSuccess: (profile: Profile) => void;
};

export function LoginAs({ profile, wallet, onSuccess }: LoginAsProps) {
  const { execute, loading } = useLogin();

  const login = async () => {
    const result = await execute({
      address: wallet,
      profileId: profile.id,
    });

    if (result.isSuccess()) {
      return onSuccess(profile);
    }

    window.alert(result.error.message);
  };

  return (
    <button disabled={loading} onClick={login}>
      {profile.handle?.fullHandle ?? profile.id}
    </button>
  );
}

type LoginOptionsProps = {
  wallet: string;
  onSuccess: (profile: Profile) => void;
};

export function LoginOptions({ wallet, onSuccess }: LoginOptionsProps) {
  const { data: profiles, error, loading } = useProfilesManaged({
    for: wallet,
    includeOwned: true
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
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

export default function ProfilePage() {
	const { data } = useProfile({
		forHandle: "lens/stani",
	});


	return (
		<div className="container flex flex-col items-center justify-center w-full max-w-lg lg:max-w-xl"></div>

	);
}
