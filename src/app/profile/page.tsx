"use client";

import { useProfile } from "@lens-protocol/react-web";

export default function ProfilePage() {
	const { data } = useProfile({
		forHandle: "lens/stani",
	});

	return (
		<div className="container flex flex-col items-center justify-center w-full max-w-lg lg:max-w-xl"></div>
	);
}
