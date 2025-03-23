import { requireAuth } from "@/lib/authActions";
import { postTag } from "@/models/tagModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  requireAuth();
  try {
    const json = (await request.json()) as { tag: string };

    const response = await postTag(json.tag, Number(params.id));

    if (!response) {
      return new NextResponse("Error adding tag to database", { status: 500 });
    }

    return new NextResponse(JSON.stringify(response), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return new NextResponse((e as Error).message, { status: 500 });
  }
}
