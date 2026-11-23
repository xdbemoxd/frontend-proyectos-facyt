import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

async function forward(response: Response) {
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const response = await backendFetch(`/api/user${request.nextUrl.search}`);
    return forward(response);
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const response = await backendFetch("/api/user", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return forward(response);
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }
}
