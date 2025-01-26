import { fetchMeDetails } from "@lens-protocol/client/actions";
import jwt from "jsonwebtoken";
import { getLensClient } from "../lens/client";
import { LensIdToken } from "./app-token";

export async function getUserProfile() {
  const client = await getLensClient();

  if (!client.isSessionClient()) {
    return {
      address: undefined,
      profile: undefined,
      username: undefined,
    };
  }

  const credentials = await client.getCredentials();

  if (!credentials || credentials.isErr()) {
    throw new Error("Unable to get credentials");
  }

  const idToken = credentials.value?.idToken;

  // Decode without verification
  const decoded = jwt.decode(idToken || "") as LensIdToken;

  if (!decoded) {
    throw new Error("Invalid ID token");
  }

  const address = decoded.sub;
  const account = await fetchMeDetails(client).unwrapOr(null);

  if (!account) {
    console.error("Profile not found, returning empty profile");
    return {
      address: undefined,
      profile: undefined,
      username: undefined,
    };
  }

  return {
    address: account.loggedInAs.account.address,
    profile: account,
    username: account.loggedInAs.account.username?.localName,
  };
}
