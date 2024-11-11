import Markdown from "@/components/content/markdown";
import Editor from "@/components/editor/plate-editor";
import ErrorPage from "@/components/error-page";
import { Footer } from "@/components/navigation/footer";
import { getAuth } from "@/lib/get-auth-clients";
import { proseClasses } from "@/styles/prose";
import { sanitize } from "isomorphic-dompurify";

const post = async ({ params }: { params: { user: string; post: string } }) => {
  const { lens } = await getAuth();

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
    const contentJson = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentJson")?.value;
    const contentHtml = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentHtml")?.value;

    if (contentJson) {
      return (
        <div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl relative">
          <div className={`text-foreground bg-background ${proseClasses}`}>
            <Editor value={contentJson} readOnly={true} />
          </div>
          <Footer />
        </div>
      );
    }

    if (!contentHtml) throw new Error("Couldn't find content");

    return (
      <div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="w-full min-h-screen py-4 my-10">
          <div
            className={proseClasses}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: intended use
            dangerouslySetInnerHTML={{ __html: sanitize(contentHtml) }}
          />
          <Footer />
        </div>
      </div>
    );
  }

  return <ErrorPage error="Couldn't find content to show" />;
};

export default post;
