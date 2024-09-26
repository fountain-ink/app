import Markdown from "@/components/content/markdown";
import ErrorPage from "@/components/error-page";
import { getAuthorizedClients } from "@/lib/get-auth-clients";
import { proseClasses } from "@/styles/prose";


import { sanitize } from "isomorphic-dompurify";

const post = async ({ params }: { params: { post: string } }) => {
  const { lens } = await getAuthorizedClients();

  const id = params.post;
  const post = await lens.publication.fetch({ forId: id });

  if (!post) return <ErrorPage error="Couldn't find post to show" />;
  if (post.__typename === "Mirror" || post.metadata.__typename === "EventMetadataV3") {
    return null;
  }

  if (post.metadata.appId !== "fountain") {
    const markdown = post?.metadata?.content;

    return <Markdown content={markdown} />;
  }

  if (post.metadata.appId === "fountain") {
    const _contentJson = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentJson")?.value;
    const contentHtml = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentHtml")?.value;

    if (!contentHtml) throw new Error("Couldn't find content");

    return (
      <div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="w-full min-h-screen py-4 my-10">
      <div
        className={proseClasses}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: intended use
            dangerouslySetInnerHTML={{ __html: sanitize(contentHtml) }}
          />
        </div>
      </div>
    );
  }

  return <ErrorPage error="Couldn't find content to show" />;
};

export default post;
