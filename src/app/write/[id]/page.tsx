import { AutoSave } from "@/components/AutoSave";
import { Editor } from "@/components/editor/Editor";
import { EditorCollaborators } from "@/components/editor/EditorCollaborators";
import { EditorDate } from "@/components/editor/EditorDate";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { cookies } from "next/headers";

async function getDraft(id: string) {
	const url = getBaseUrl();
	const refreshToken = cookies().get("refreshToken")?.value;

	const response = await fetch(`${url}/api/drafts?id=${id}`, {
		method: "GET",
		headers: {
			Cookie: `refreshToken=${refreshToken}`,
		},
	});

	console.log(response);

	if (!response.ok) {
		throw new Error("Failed to fetch draft");
	}

	const { draft } = await response.json();
	return draft;
}

export default async function WriteDraft({
	params,
}: { params: { id: string } }) {
	const draft = await getDraft(params.id);

	if (!draft) {
		return <div>Draft not found</div>;
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center text-foreground bg-background">
			<div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl">
				<div className="w-full min-h-screen py-4 my-10">
					<EditorDate />
					<EditorCollaborators />
					<Editor document={draft.content}>
						<AutoSave documentId={params.id} />
					</Editor>
				</div>
			</div>
		</div>
	);
}
