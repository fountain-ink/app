import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";

export const UserCover = ({ profile, className }: { profile?: Profile | ProfileFragment; className?: string }) => {
  const cover = profile?.metadata?.coverPicture?.optimized || profile?.metadata?.coverPicture?.raw;

  if (!cover) {
    return <div className="w-full h-64 bg-card/20 rounded-lg" />;
  }

  return (
    <div className={`h-64 overflow-hidden rounded-lg ${className}`}>
      <img className="w-screen md:max-w-3xl h-full object-cover" src={cover.uri} alt={profile?.handle?.localName} />
    </div>
  );
};
