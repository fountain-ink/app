/**
 * Checks if a slug is available in the database for a specific handle
 * @param slug The slug to check
 * @param handle The handle to check uniqueness for
 * @returns A promise resolving to an object with available status and slug
 */
export async function checkSlugAvailability(
  slug: string,
  handle?: string
): Promise<{ available: boolean; slug: string }> {
  try {
    if (!slug) {
      return { available: true, slug: '' };
    }

    let url = `/api/posts/slug/check?slug=${encodeURIComponent(slug)}`;
    if (handle) {
      url += `&handle=${encodeURIComponent(handle)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error checking slug availability:', await response.text());
      return { available: true, slug }; // Default to available on error
    }

    const data = await response.json();
    return {
      available: data.available,
      slug: data.slug
    };
  } catch (error) {
    console.error('Failed to check slug availability:', error);
    return { available: true, slug }; // Default to available on error
  }
} 