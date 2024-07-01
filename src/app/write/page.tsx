import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Editor } from "@/components/editor/Editor";
import { EditorCollaborators } from "@/components/editor/EditorCollaborators";
import { EditorDate } from "@/components/editor/EditorDate";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-[#d0dff7] text-[#432a21]">
			<div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl lg:max-w-4xl ">
				<div className="w-full">
					<ThemeSwitcher />
					<EditorDate />
					<EditorCollaborators />
					<Editor />
				</div>
			</div>
		</div>
	);
}
