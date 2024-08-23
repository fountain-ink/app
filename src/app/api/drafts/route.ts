import { getDatabase } from "@/lib/getDatabase";
import { getLensClient } from "@/lib/getLensClient";
import { NextResponse, type NextRequest } from "next/server";

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

	return new NextResponse("success", { status: 200 });
}

export async function POST(req: NextRequest) {}

export async function DELETE(req: NextRequest) {}
