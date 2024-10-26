import { DraftsList } from "@/components/draft/draft-list";

const drafts = async () => {
  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="flex flex-col grow items-stretch justify-center w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center m-8">Drafts</h1>
        <DraftsList />
      </div>
    </div>
  );
};

export default drafts;
