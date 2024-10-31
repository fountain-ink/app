import PlateEditor from "@/components/editor/plate-editor";
import { proseClasses } from "@/styles/prose";

export default async function WriteDraft({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-foreground bg-background">
      <div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="w-full min-h-screen py-4 my-20">
            <PlateEditor />
        </div>
      </div>
    </div>
  );
}
