"use server";

import { env } from "@/env";
import { LensClient, production } from "@lens-protocol/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const client = new LensClient({
	environment: production,
});

interface LensJwtToken {
	evmAddress: string;
	id: string;
	role: string;
	authorizationId: string;
	iat: number;
	exp: number;
}

export async function serverLogin(refreshToken: string) {
	"use server";

	// Check lens JWT token
	await client.authentication.authenticateWith({ refreshToken });
	const isAuthenticated = await client.authentication.isAuthenticated();
	const lensJwtData = jwt.decode(refreshToken) as LensJwtToken;

	if (!isAuthenticated || !lensJwtData) {
		throw new Error("Invalid identity token");
	}

	const profileId = lensJwtData.id;
	const address = lensJwtData.evmAddress;

	const supabaseJwt = jwt.sign(
		{ profileId, address, role: "authenticated" },
		env.SUPABASE_JWT_SECRET,
	);

	console.log(`Logged in as ${profileId}`);

	cookies().set("db-auth", supabaseJwt, {
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "lax",
	});

	return {
		jwt: supabaseJwt,
	};
}
