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

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/users/[id]">,
) {
  const { id } = await context.params;
  try {
    const response = await backendFetch(`/api/user/${id}`);
    return forward(response);
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/users/[id]">,
) {
  const { id } = await context.params;
  try {
    const payload = await request.json();
    const response = await backendFetch(`/api/user/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return forward(response);
  } catch {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }
}
