"use client";

import { ConnectKitButton } from "connectkit";

export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[#d0dff7] text-[#432a21]">
			<div className="container flex flex-col items-center justify-center w-full max-w-lg lg:max-w-xl ">
				<ConnectKitButton />
			</div>
		</main>
	);
}
