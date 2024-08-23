import { getDatabase } from "@/lib/getDatabase";
import { getLensClient } from "@/lib/getLensClient";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const refreshToken = req.headers.get("Authorization");

	if (!refreshToken) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const lensClinet = await getLensClient(refreshToken);

	const isAuthenticated = await lensClinet.authentication.isAuthenticated();

	if (!isAuthenticated) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const supabase = getDatabase();

	const profileId = await lensClinet.authentication.getProfileId();
	const {
		count,
		data: drafts,
		status,
		statusText,
		error,
	} = await supabase.from("drafts").select().eq("author_id", profileId);

	if (error) {
		return new NextResponse(error.message, { status: 500 });
	}

	if (status !== 200) {
		return new NextResponse(statusText, { status: 500 });
	}

	return NextResponse.json({ drafts }, { status: 200 });
}

export async function POST(req: NextRequest) {}

export async function DELETE(req: NextRequest) {}
