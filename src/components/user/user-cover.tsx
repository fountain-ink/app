import { storageClient } from "@/lib/lens/storage-client";
import { Account } from "@lens-protocol/client";

export const resolveImageUrl = (uri: string | undefined): string => {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return `https://fountain.4everland.link/ipfs/${uri.slice(7)}`;
  }
  if (uri.startsWith("lens://")) {
    return storageClient.resolve(uri);
  }
  return uri;
};

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
