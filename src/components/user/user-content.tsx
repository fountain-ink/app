"use client";

import type { ProfileFragment } from "@lens-protocol/client";
import {
  type Profile,
  type ProfileId,
  PublicationMetadataMainFocusType,
  PublicationType,
  appId,
  usePublications,
} from "@lens-protocol/react-web";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ErrorPage from "../misc/error-page";
import { PostView } from "../post/post-view";
import { Card, CardFooter, CardHeader } from "../ui/card";
import { DraftCreateButton } from "../draft/draft-create-button";

export const UserContent = ({
  profile,
  loading,
  contentType = "articles",
  isUserProfile = false,
}: {
  profile: Profile | ProfileFragment;
  loading?: boolean;
  contentType?: string;
  isUserProfile?: boolean;
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
          <span className="font-[family-name:var(--title-font)] text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-[letter-spacing:var(--title-letter-spacing)] font-[color:var(--title-color)] overflow-hidden line-clamp-2">
            Nothing here yet...
          </span>
        </CardHeader>
        <CardFooter>{isUserProfile && <DraftCreateButton />}</CardFooter>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {posts}
    </motion.div>
  );
};
