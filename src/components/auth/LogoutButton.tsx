"use client";

import { useLogout } from "@lens-protocol/react-web";
import { Button } from "../ui/button";

export function LogoutButton() {
	const { execute, loading } = useLogout();

	return (
		<Button variant="default" disabled={loading} onClick={() => execute()}>
			Log out
		</Button>
	);
}
