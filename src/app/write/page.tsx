import { EditorMenu } from "~/components/EditorMenu";
import Tiptap from "~/components/TIptap";

export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[#d0dff7] text-[#432a21]">
			<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
         <Tiptap />
			</div>
		</main>
	);
}
