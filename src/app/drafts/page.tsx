import { CloudDraftsList } from "@/components/draft/draft-list-cloud";
import { getAuthorizedClients } from "@/lib/get-auth-clients";

const drafts = async () => {
  const { profileId } = await getAuthorizedClients();
  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="flex flex-col grow items-stretch justify-center w-full max-w-3xl sm:max-w-3xl">
        <h1 className="text-4xl font-bold text-center m-8">Drafts</h1>
        <CloudDraftsList profileId={profileId} />
      </div>
    </div>
  );
};

export default drafts;
