import { getDatabase } from "@/lib/getDatabase";
import { getLensClient } from "@/lib/getLensClient";
import { type NextRequest, NextResponse } from "next/server";

async function getAuthorizedClients(refreshToken: string | null) {
	if (!refreshToken) {
		throw new Error("Unauthorized");
	}

	const lens = await getLensClient(refreshToken);
	const isAuthenticated = await lens.authentication.isAuthenticated();
	const profileId = await lens.authentication.getProfileId();

	if (!isAuthenticated || !profileId) {
		throw new Error("Unauthenticated");
	}

	const db = getDatabase();

	return { lens, profileId, db };
}

export async function GET(req: NextRequest) {
	try {
		const refreshToken = req.headers.get("Authorization");
		const { profileId, lens, db } = await getAuthorizedClients(refreshToken);

		const { data: drafts, error } = await db
			.from("drafts")
			.select()
			.eq("author_id", profileId);

		return NextResponse.json({ drafts }, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	}
}

export async function POST(req: NextRequest) {
	// Implement POST logic here
}

export async function DELETE(req: NextRequest) {
	// Implement DELETE logic here
}
