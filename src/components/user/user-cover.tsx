import { Account } from "@lens-protocol/client";

export const UserCover = ({ profile, className }: { profile?: Account; className?: string }) => {
  const cover = profile?.metadata?.coverPicture?.optimized || profile?.metadata?.coverPicture?.raw;

  if (!cover) {
    return <div className="w-full h-64 bg-card/20 sm:rounded-lg" />;
  }

  return (
    <div className={`relative w-full aspect-[3/1] overflow-hidden md:rounded-lg ${className}`}>
      <img
        className="absolute inset-0 w-full h-full object-cover object-center"
        src={cover.uri}
        alt={profile?.username?.localName}
      />
    </div>
  );
};
