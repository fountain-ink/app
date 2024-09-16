import { getAuthorizedClients } from "@/lib/get-auth-clients";

const post = async ({ params }: { params: { post: string } }) => {
  const { lens } = await getAuthorizedClients();

  const id = params.post;
  const lensPost = await lens.publication.fetch({
    forId: id,
  });

  if (!lensPost) throw new Error("(╥_╥) Post not found");

  console.log(lensPost);

  if (
    lensPost.__typename === "Post" &&
    lensPost.metadata.__typename === "ArticleMetadataV3" &&
    lensPost.metadata.appId === "fountain"
  ) {
    const _contentJson = lensPost?.metadata?.attributes?.find((attr: any) => attr.key === "contentJson")?.value;
    const contentHtml = lensPost?.metadata?.attributes?.find((attr: any) => attr.key === "contentHtml")?.value;

    return (
      <div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="w-full min-h-screen py-4 my-10">
          <div
            className="prose prose-sm sm:prose-base prose-img:prose-h1:font-martina prose-h1:my-8 prose-h1:text-center prose-h1:text-6xl lg:prose-lg focus:outline-none rounded-lg"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default post;
