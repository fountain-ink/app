import { MeResult } from "@lens-protocol/client";
import { fetchMeDetails } from "@lens-protocol/client/actions";
import { getLensClient } from "../lens/client";

export const getSession = async (): Promise<MeResult | null> => {
  const client = await getLensClient();

  if (client.isSessionClient()) {
    const fetchResult = await fetchMeDetails(client);

    if (fetchResult.isErr()) {
      console.error(fetchResult.error);
      return null;
    }

    return fetchResult.value;
  }

  return null;
};
