"use client";

import { useLogout } from "@lens-protocol/react-web";
import { Button } from "../ui/button";

export const logoutProfile = () => {
	const { execute, loading } = useLogout();

	if (loading) return;

	execute();
};

export function LogoutButton() {
	return (
		<Button variant="default" onClick={() => logoutProfile()}>
			Log out
		</Button>
	);
}
