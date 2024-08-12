import { serifFontVar } from "@/styles/fonts";

export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
			<div className={serifFontVar}>
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
					<h1>Welcome To Fountain.</h1>
				</div>
			</div>
		</main>
	);
}
