"use client";

import { useProfile } from "@lens-protocol/react-web";
import { ConnectKitButton } from "connectkit";

export default function ProfilePage() {
	const { data } = useProfile({
		forHandle: "lens/stani",
		suspense: true,
	});

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[#d0dff7] text-[#432a21]">
			<div className="container flex flex-col items-center justify-center w-full max-w-lg lg:max-w-xl ">
				<ConnectKitButton />
			</div>
		</main>
	);
}
