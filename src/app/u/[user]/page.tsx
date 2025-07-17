import { evmAddress, MainContentFocus } from "@lens-protocol/client";
import { fetchAccount, fetchPosts } from "@lens-protocol/client/actions";
import { ArticleFeed } from "@/components/feed/feed-articles";
import { StructuredData } from "@/components/seo/structured-data";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { generateCanonicalUrl } from "@/lib/seo/canonical";
import { generatePersonSchema } from "@/lib/seo/structured-data";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { address } = await getUserAccount();
  const localName = params.user.toLowerCase();
  const account = await fetchAccount(lens, { username: { localName } }).unwrapOr(null);

  const posts = await fetchPosts(lens, {
    filter: {
      authors: [evmAddress(account?.address)],
      metadata: { mainContentFocus: [MainContentFocus.Article] },
    },
  });

  if (posts.isErr()) {
    console.error(posts.error);
    return null;
  }

  const isUserProfile = address === account?.address;

  const personSchema = account
    ? generatePersonSchema({
        name: account.metadata?.name || account.username?.localName || account.address,
        username: account.username?.localName || "",
        description: account.metadata?.bio || undefined,
        image: account.metadata?.picture,
        url: generateCanonicalUrl(`/b/${params.user}`), // Point to blog as canonical
      })
    : null;

  return (
    <div className="flex flex-col my-4 gap-4">
      {personSchema && <StructuredData data={personSchema} />}
      <ArticleFeed posts={[...posts.value.items]} isUserProfile={isUserProfile} forceViewMode="single" />
    </div>
  );
};

export default UserPage;
