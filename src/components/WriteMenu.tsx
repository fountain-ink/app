"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import Link from "next/link";
import { Button } from "./ui/button";

export const WriteMenu = () => {
	const { data: session, loading, error } = useSession();

	if (loading || error) {
		return null;
	}

	if (session?.type !== SessionType.WithProfile) {
		return null;
	}

	return (
		<Link href={"/write"} className="h-10 flex items-center justify-center">
			<Button>Write</Button>
		</Link>
	);
};
