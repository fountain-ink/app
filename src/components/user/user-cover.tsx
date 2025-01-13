import { Account } from "@lens-protocol/client";

export const UserCover = ({ profile, className }: { profile?: Account; className?: string }) => {
  const cover = profile?.metadata?.coverPicture;

  if (!cover) {
    return (
      <div className="w-full h-64 rounded-xl relative overflow-hidden">
        <div className="placeholder-background " />
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-[3/1] overflow-hidden md:rounded-lg ${className}`}>
      <img
        className="absolute inset-0 w-full h-full object-cover object-center"
        src={cover}
        alt={`${profile?.username?.localName}'s cover`}
      />
    </div>
  );
};
