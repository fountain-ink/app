import type { ProfileFragment } from "@lens-protocol/client";
import { type Profile, SessionType, useSession } from "@lens-protocol/react-web";

export const UserName = ({ profile }: { profile?: Profile | ProfileFragment }) => {
  const name = profile?.metadata?.displayName;
  if (!name) {
    return null;
  }

  return <div className="text-foreground text-3xl font-bold">{name}</div>;
};
