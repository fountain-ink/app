import { LensClient } from "@lens-protocol/client";

export async function getUserProfile(lens: LensClient) {
  let isAuthenticated = false;
  try {
    isAuthenticated = await lens.authentication.isAuthenticated();
  } catch (error) {
    console.log(error);
  }

  if (!isAuthenticated) {
    return { 
      profileId: undefined, 
      profile: undefined, 
      handle: undefined 
    };
  }

  const profileId = await lens.authentication.getProfileId();
  const profile = await lens.profile.fetch({ forProfileId: profileId })  
  const handle = profile?.handle?.localName;

  if (!profileId) {
    throw new Error("Unauthenticated");
  }

  return { profileId, profile, handle };
}

