import Link from "next/link";
import { serifFontVar } from "~/styles/fonts";

export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[#d0dff7] text-[#432a21]">
			<div className={serifFontVar}>
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
					<h1 className="text-2xl font-extrabold tracking-tight sm:text-[5rem]">
						{`Let's start your fountain journey...`}
					</h1>
					<Link href={"/write"}>Editor</Link>
				</div>
			</div>
		</main>
	);
}
