"use server";

import { client } from "@/lib/thirdWebClient";
import { cookies } from "next/headers";
import { VerifyLoginPayloadParams, createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";

const privateKey = process.env.THIRDWEB_ADMIN_PRIVATE_KEY || "";

if (!privateKey) {
	throw new Error("Missing THIRDWEB_ADMIN_PRIVATE_KEY in .env file.");
}

const thirdwebAuth = createAuth({
	domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "",
	adminAccount: privateKeyToAccount({ client, privateKey }),
	client: client,
});

export const generatePayload = thirdwebAuth.generatePayload;

export async function login(payload: VerifyLoginPayloadParams) {
	const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
	if (verifiedPayload.valid) {
		const jwt = await thirdwebAuth.generateJWT({
			payload: verifiedPayload.payload,
			context: {
				admin: true,
			},
		});
		cookies().set("jwt", jwt);
	}
}

export async function isLoggedIn() {
	const jwt = cookies().get("jwt");
	if (!jwt?.value) {
		return false;
	}

	const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
	if (!authResult.valid) {
		return false;
	}
	return true;
}

export async function logout() {
	cookies().delete("jwt");
}
