"use client";

import { ArticleLayout } from "../navigation/article-layout";
import { Button } from "../ui/button";
import Link from "next/link";

const PostDeletedView = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8">
      <div className="text-6xl mb-4">(ಥ﹏ಥ)</div>
      <h1 className="text-3xl font-bold title mb-4">This post was deleted</h1>
      <p className="text-xl font-medium text-muted-foreground mb-8">
        Sorry, the content you're looking for is no longer available.
      </p>
    </div>
  );
};

export default PostDeletedView;
