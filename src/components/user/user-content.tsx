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
import ErrorPage from "../error-page";
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
        publishedOn: contentType === "articles" ? [appId("fountain")] : undefined,
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

  if (loading || publicationsLoading) {
    return null;
  }

  if (error) {
    toast.error(error.message);
    return <ErrorPage error={error.message} />;
  }

  const posts = publications.map((publication) => {
    if (publication.__typename === "Post") {
      if (contentType === "articles") {
        return (
          <PostView
            options={{
              showContent: false,
              showAuthor: false,
              showTitle: true,
              showSubtitle: true,
              showDate: true,
              showPreview: true,
            }}
            key={publication.id}
            authorIds={[publication.by.id]}
            item={publication}
          />
        );
      }

      return (
        <PostView
          options={{
            showContent: true,
            showAuthor: true,
            showTitle: false,
            showSubtitle: false,
            showDate: true,
            showPreview: false,
          }}
          key={publication.id}
          authorIds={[publication.by.id]}
          item={publication}
        />
      );
    }
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
