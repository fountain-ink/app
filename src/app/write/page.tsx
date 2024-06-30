import { Editor } from "@/components/editor/Editor";
import { EditorDate } from "@/components/editor/EditorDate";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-[#d0dff7] text-[#432a21]">
			<div className="container flex flex-col items-center justify-center w-full max-w-xl lg:max-w-2xl ">
				<div className="w-full">
					<EditorDate />
				</div>
				<Editor />
			</div>
		</div>
	);
}
