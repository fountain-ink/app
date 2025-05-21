import { PostId } from "@lens-protocol/client";

interface ManagePostRecordArgs {
  lensSlug: string;
  draftSlug: string | undefined;
  username: string;
  postId: PostId;
}

export async function createPostRecord({
  lensSlug,
  draftSlug,
  username,
  postId,
}: ManagePostRecordArgs): Promise<void> {
  try {
    const recordResponse = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lens_slug: lensSlug,
        slug: draftSlug,
        handle: username,
        post_id: postId,
      }),
    });

    if (!recordResponse.ok) {
      console.error('Failed to create/update post record:', await recordResponse.text());
    } else {
      console.log('Post record created/updated successfully');
    }
  } catch (error) {
    console.error('Error creating/updating post record:', error);
  }
}
