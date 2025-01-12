import { fetchMeDetails } from "@lens-protocol/client/actions";
import jwt from "jsonwebtoken";
import { getLensClient } from "../lens/client";

interface LensIdToken {
  sub: string; // signedBy address
  iss: string; // API endpoint
  aud: string; // App address
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
  sid: string; // Session ID
  act?: string; // Optional account address for managers
  "tag:lens.dev,2024:sponsored"?: boolean;
  "tag:lens.dev,2024:role"?: "ACCOUNT_OWNER" | "ACCOUNT_MANAGER" | "ONBOARDING_USER" | "BUILDER";
}

export async function getUserProfile() {
  const client = await getLensClient();

  if (!client.isSessionClient()) {
    return {
      profileId: undefined,
      profile: undefined,
      handle: undefined,
    };
  }

  const credentials = await client.getCredentials();

  if (!credentials || credentials.isErr()) {
    throw new Error("Unable to get credentials");
  }

  const idToken = credentials.value?.idToken;

  // Decode without verification since we trust the source
  const decoded = jwt.decode(idToken || "") as LensIdToken;
  console.log(decoded);

  if (!decoded) {
    throw new Error("Invalid ID token");
  }

  // Use the subject (wallet address) or act (managed account) to fetch the profile
  const address = decoded.sub;
  // const account = await fetchAccount(client, { address });
  const account = await fetchMeDetails(client).unwrapOr(null);

  if (!account) {
    throw new Error("Profile not found");
  }

  return {
    profileId: account.loggedInAs.account.address,
    profile: account,
    handle: address, // FIXME
    role: decoded["tag:lens.dev,2024:role"],
    sponsored: decoded["tag:lens.dev,2024:sponsored"] || false,
  };
}
