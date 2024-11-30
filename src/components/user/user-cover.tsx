import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";

export const UserCover = ({ profile, className }: { profile?: Profile | ProfileFragment; className?: string }) => {
  const cover = profile?.metadata?.coverPicture?.optimized || profile?.metadata?.coverPicture?.raw;

  if (!cover) {
    return <div className="w-full h-64 bg-card/20 rounded-b-xl" />;
  }

  return (
    <div className={`w-full h-64 overflow-hidden rounded-b-lg ${className}`}>
      <img className="w-full h-full object-cover" src={cover.uri} alt={profile?.handle?.localName} />
    </div>
  );
};
