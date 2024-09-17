"use client";

import type { ProfileFragment } from "@lens-protocol/client";
import {
  appId,
  type Profile,
  type ProfileId,
  PublicationMetadataMainFocusType,
  PublicationType,
  usePublications,
} from "@lens-protocol/react-web";
import { toast } from "sonner";
import { WriteMenu } from "../navigation/write-menu";
import { PostView } from "../post/post-view";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";

export const UserContent = ({
  profile,
  loading,
  contentType = "articles",
}: {
  profile: Profile | ProfileFragment;
  loading?: boolean;
  contentType?: string;
}) => {
  const {
    data: publications,
    loading: publicationsLoading,
    error,
  } = usePublications({
    where: {
      from: [profile.id as ProfileId],
      metadata: {
        publishedOn: [appId("fountain")],
        mainContentFocus:
          contentType === "articles"
            ? [PublicationMetadataMainFocusType.Article]
            : [
                PublicationMetadataMainFocusType.Article,
                PublicationMetadataMainFocusType.Image,
                PublicationMetadataMainFocusType.Audio,
                PublicationMetadataMainFocusType.TextOnly,
                PublicationMetadataMainFocusType.CheckingIn,
                PublicationMetadataMainFocusType.Story,
                PublicationMetadataMainFocusType.Video,
                PublicationMetadataMainFocusType.Embed,
                PublicationMetadataMainFocusType.Link,
              ],
      },
      publicationTypes: [PublicationType.Post],
    },
  });

  if (loading || publicationsLoading || !publications) {
    return null;
  }

  if (error) {
    toast.error(error);
    return null;
  }

  const posts = publications.map((publication) => {
    if (publication.__typename === "Post")
      return <PostView key={publication.id} authorIds={[publication.by.id]} post={publication} />;
  });

  if (posts.length === 0) {
    return (
      <Card className="m-20 bg-transparent group border-0 flex flex-col gap-4 items-center justify-center shadow-none drop-shadow-none">
        <CardHeader>
          <CardTitle>Nobody here but us chickens</CardTitle>
        </CardHeader>
        <CardFooter>
          <WriteMenu text="Start Writing" />
        </CardFooter>
      </Card>
    );
  }

  return <>{posts}</>;
};
