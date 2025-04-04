import { Account } from "@lens-protocol/client";
import { resolveImageUrl } from "./user-avatar";

export const UserCover = ({ account, className }: { account?: Account; className?: string }) => {
  const cover = resolveImageUrl(account?.metadata?.coverPicture);

  if (!cover) {
    return (
      <div className="w-full h-64 rounded-b-lg relative overflow-hidden">
        <div className="placeholder-background " />
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-[3/1] overflow-hidden md:rounded-b-lg ${className}`}>
      <img
        className="absolute inset-0 w-full h-full object-cover object-center"
        src={cover}
        alt={`${account?.username?.localName}'s cover`}
      />
    </div>
  );
};
