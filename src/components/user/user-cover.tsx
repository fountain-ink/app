import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";

export const UserCover = ({ profile, className }: { profile?: Profile | ProfileFragment; className?: string }) => {
  const cover = profile?.metadata?.coverPicture?.optimized || profile?.metadata?.coverPicture?.raw;

  if (!cover) {
    return <div className="w-full h-64 bg-card/20 sm:rounded-lg" />;
  }

  return (
    <div className={`relative w-full aspect-[3/1] overflow-hidden md:rounded-lg ${className}`}>
      <img
        className="absolute inset-0 w-full h-full object-cover object-center"
        src={cover.uri}
        alt={profile?.handle?.localName}
      />
    </div>
  );
};
