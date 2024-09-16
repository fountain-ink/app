import { getAuthorizedClients } from "@/lib/get-auth-clients";

import { sanitize } from "isomorphic-dompurify";

const post = async ({ params }: { params: { post: string } }) => {
  const { lens } = await getAuthorizedClients();

  const id = params.post;
  const post = await lens.publication.fetch({
    forId: id,
  });

  if (!post) throw new Error("(╥_╥) Post not found");

  if (
    post.__typename === "Post" &&
    post.metadata.__typename === "ArticleMetadataV3" &&
    post.metadata.appId === "fountain"
  ) {
    const _contentJson = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentJson")?.value;
    const contentHtml = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentHtml")?.value;

    if (!contentHtml) throw new Error("(╥_╥) Post not found");

    return (
      <div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="w-full min-h-screen py-4 my-10">
          <div
            className="prose prose-sm sm:prose-base prose-img:prose-h1:font-martina prose-h1:my-8 prose-h1:text-center prose-h1:text-6xl lg:prose-lg focus:outline-none rounded-lg"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: intended use
            dangerouslySetInnerHTML={{ __html: sanitize(contentHtml) }}

            
          />
        </div>
      </div>
    );
  }

  return null;
};

export default post;
