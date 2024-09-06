import { AutoSave } from "@/components/auto-save";
import { Editor } from "@/components/editor/editor";
import { EditorCollaborators } from "@/components/editor/editor-collaborators";
import { EditorDate } from "@/components/editor/editor-date";

export default async function WriteDraft({
	params,
}: { params: { id: string } }) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center text-foreground bg-background">
			<div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl">
				<div className="w-full min-h-screen space-y-4 py-4 my-10">
					<EditorDate />
					<EditorCollaborators />
					<Editor initialContent={undefined} documentId={undefined}>
						<AutoSave documentId={undefined} />
					</Editor>
				</div>
			</div>
		</div>
	);
}
