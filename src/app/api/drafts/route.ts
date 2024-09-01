import { getAuthorizedClients } from "@/lib/getAuthorizedClients";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
	try {
		const refreshToken = cookies().get("refreshToken")?.value;

		const { profileId, db } = await getAuthorizedClients();
		const url = new URL(req.url);
		const draftId = url.searchParams.get("id");

		if (draftId) {
			const { data: draft, error } = await db
				.from("drafts")
				.select()
				.eq("id", draftId)
				.eq("author_id", profileId)
				.single();

			if (error) {
				throw new Error(error.message);
			}

			if (!draft) {
				return NextResponse.json(
					{ error: "Draft not found or not authorized" },
					{ status: 404 },
				);
			}

			return NextResponse.json({ draft }, { status: 200 });
		}

		// Fetch all drafts
		const { data: drafts, error } = await db
			.from("drafts")
			.select()
			.eq("author_id", profileId);

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ drafts }, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	}
}

export async function POST(req: NextRequest) {
	try {
		const { profileId, db } = await getAuthorizedClients();

		const body = await req.json();
		const { title } = body;

		if (!title) {
			return NextResponse.json({ error: "Missing title" }, { status: 400 });
		}

		const { data, error } = await db
			.from("drafts")
			.insert({ author_id: profileId, title })
			.select()
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ draft: data }, { status: 201 });
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	}
}

export async function PUT(req: NextRequest) {
	try {
		const { profileId, db } = await getAuthorizedClients();

		const url = new URL(req.url);
		const draftId = url.searchParams.get("id");

		if (!draftId) {
			return NextResponse.json({ error: "Missing draft ID" }, { status: 400 });
		}

		const body = await req.json();
		const { content, title } = body;

		if (!content && !title) {
			return NextResponse.json(
				{ error: "Missing content or title" },
				{ status: 400 },
			);
		}

		const updateData: { content_json?: object; title?: string } = {};
		if (content) updateData.content_json = content;
		if (title) updateData.title = title;

		const { data, error } = await db
			.from("drafts")
			.update(updateData)
			.match({ id: draftId, author_id: profileId })
			.select()
			.single();

		if (error) {
			throw new Error(error.message);
		}

		if (!data) {
			return NextResponse.json(
				{ error: "Draft not found or not authorized" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ draft: data }, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			console.error(error);

			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { profileId, db } = await getAuthorizedClients();

		const url = new URL(req.url);
		const draftId = url.searchParams.get("id");

		if (!draftId) {
			return NextResponse.json({ error: "Missing draft ID" }, { status: 400 });
		}

		const { data, error } = await db
			.from("drafts")
			.delete()
			.match({ id: draftId, author_id: profileId })
			.select()
			.single();

		if (error) {
			throw new Error(error.message);
		}

		if (!data) {
			return NextResponse.json(
				{ error: "Draft not found or not authorized" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ message: "Draft deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	}
}
