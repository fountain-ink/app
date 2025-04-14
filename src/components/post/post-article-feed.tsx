"use client";

import type { Account, AnyPost } from "@lens-protocol/client";
import { motion } from "motion/react";
import { DraftCreateButton } from "../draft/draft-create-button";
import { GraphicHand2 } from "../icons/custom-icons";
import { PostView } from "./post-view";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

export const ArticleFeed = ({
  posts,
  isUserProfile = false,
}: {
  posts: AnyPost[];
  isUserProfile?: boolean;
}) => {

  const postViews = posts.map((post) => {
    if (post.__typename !== "Post") {
      return null;
    }

    if (post.metadata.__typename !== "ArticleMetadata") {
      return null;
    }

    if (!post.metadata.attributes.some((attribute) => attribute.key === "contentJson")) {
      return null;
    }

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
  }).filter(Boolean);

  if (postViews.length === 0) {
    return (
      <Card className="m-0 md:m-10 bg-transparent group border-0 flex flex-col gap-4 items-center justify-center shadow-none drop-shadow-none">
        <CardHeader>
          <GraphicHand2 />
        </CardHeader>
        <CardContent>
          <span className="font-[family-name:var(--title-font)] text-lg lg:text-xl text-center font-[letter-spacing:var(--title-letter-spacing)] font-[color:var(--title-color)] overflow-hidden line-clamp-2">
            Nothing here yet{isUserProfile ? ", but the world awaits your words" : ".."}.
          </span>
        </CardContent>
        <CardFooter>{isUserProfile && <DraftCreateButton text="Start writing" />}</CardFooter>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 my-4"
    >
      {postViews}
    </motion.div>
  );
};
