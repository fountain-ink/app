import { ProfileFragment } from "@lens-protocol/client";
import { type ProfileId, useProfiles } from "@lens-protocol/react-web";
import { UserAvatar } from "./user-avatar";
import { UserCard } from "./user-card";

export const LazyAuthorView = ({
  profileIds,
  showAvatar = true,
  showName = true,
  showHandle = true,
}: {
  profileIds: ProfileId[];
  showAvatar?: boolean;
  showName?: boolean;
  showHandle?: boolean;
}) => {
  const { data: profiles, loading, error } = useProfiles({ where: { profileIds } });

  if (profiles?.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: profileIds.length }).map((_e, index) => (
          <span key={`skeleton-${index}-${profileIds[index]}`} className="flex flex-row gap-2 items-center">
            {showAvatar && <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />}
            {showName && <div className="w-20 h-4 bg-muted animate-pulse rounded-full" />}
            {showHandle && <div className="w-24 h-4 bg-muted animate-pulse rounded-full" />}
          </span>
        ))}
      </div>
    );
  }
  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error loading profiles</span>;
  if (!profiles || profiles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {profiles.map((profile) => (
        <span key={profile.id} className="flex flex-row gap-2 items-center">
          {showAvatar && <UserAvatar className="w-6 h-6" profile={profile} />}
          {showName && <b className="text-foreground">{profile.metadata?.displayName}</b>}
          {showHandle && <span className="text-foreground">@{profile.handle?.localName}</span>}
        </span>
      ))}
    </div>
  );
};

export const AuthorView = ({
  profiles,
  showAvatar = true,
  showName = true,
  showHandle = true,
  showCard = true,
}: {
  profiles: ProfileFragment[];
  showAvatar?: boolean;
  showName?: boolean;
  showHandle?: boolean;
  showCard?: boolean;
}) => {
  if (!profiles || profiles.length === 0) return null;

  const conent = (
    <div className="flex flex-wrap gap-2">
      {profiles.map((profile) => {
        const item = (
          <span key={profile.id} className="flex flex-row gap-2 items-center">
            {showAvatar && <UserAvatar className="w-6 h-6" profile={profile} />}
            {showName && <span className="font-[family-name:--title-font]">{profile.metadata?.displayName}</span>}
            {showHandle && <span className="">@{profile.handle?.localName}</span>}
          </span>
        );
        if (showCard) {
          return (
            <UserCard linkProfile handle={profile.handle?.localName}>
              {item}
            </UserCard>
          );
        }

        return item;
      })}
    </div>
  );

  return conent;
};
