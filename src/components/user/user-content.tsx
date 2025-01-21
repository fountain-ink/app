"use client";

import type { Account, AnyPost, Post } from "@lens-protocol/client";
import { motion } from "framer-motion";
import { DraftCreateButton } from "../draft/draft-create-button";
import { PostView } from "../post/post-view";
import { Card, CardFooter, CardHeader } from "../ui/card";

export const UserContent = ({
  posts,
  profile,
  loading,
  contentType = "articles",
  isUserProfile = false,
}: {
  posts: AnyPost[];
  profile: Account;
  loading?: boolean;
  contentType?: string;
  isUserProfile?: boolean;
}) => {
  if (loading) {
    return null;
  }

  // if (error) {
  //   toast.error(error.message);
  //   return <ErrorPage error={error.message} />;
  // }

  const postViews = posts.map((post) => {
    if (post.__typename === "Post") {
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
            key={post.id}
            authors={[post.author.address]}
            item={post}
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
          key={post.id}
          authors={[post.author.address]}
          item={post}
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
      {postViews}
    </motion.div>
  );
};
