import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DONE_LINE = "data: [DONE]\n\n";

export async function POST(req: NextRequest) {
  const apiKey = process.env.AMANAI_API_KEY;
  const baseUrl =
    process.env.AMANAI_API_BASE_URL || "https://api.amanai.dev/v1";

  if (!apiKey) {
    return NextResponse.json(
      { error: "AMANAI_API_KEY tidak dikonfigurasi di .env.local" },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const {
    model,
    messages,
    stream = true,
    temperature = 0.7,
    max_tokens,
  } = body;

  if (!model || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Missing model or messages" },
      { status: 400 }
    );
  }

  const upstreamPayload: Record<string, unknown> = {
    model,
    messages,
    stream,
    temperature,
  };
  if (max_tokens) upstreamPayload.max_tokens = max_tokens;

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(upstreamPayload),
      cache: "no-store",
    });
  } catch (err: any) {
    console.error("[/api/chat] Upstream fetch failed:", err);
    return NextResponse.json(
      {
        error: "Gagal menghubungi AmanAI API",
        details: err?.message || String(err),
      },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    let errorText = "";
    try {
      errorText = await upstream.text();
    } catch {}
    console.error(
      "[/api/chat] Upstream error",
      upstream.status,
      errorText.slice(0, 500)
    );
    if (stream) {
      const encoder = new TextEncoder();
      const errStream = new ReadableStream({
        start(controller) {
          const errMsg = `Upstream ${upstream.status}: ${
            errorText.slice(0, 300) || upstream.statusText
          }`;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errMsg })}\n\n`
            )
          );
          controller.enqueue(encoder.encode(DONE_LINE));
          controller.close();
        },
      });
      return new Response(errStream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }
    return NextResponse.json(
      {
        error: `API error: ${upstream.status}`,
        details: errorText.slice(0, 1000),
      },
      { status: upstream.status }
    );
  }

  if (!stream) {
    try {
      const data = await upstream.json();
      return NextResponse.json(data);
    } catch (e: any) {
      return NextResponse.json(
        { error: "Failed to parse upstream JSON", details: e?.message },
        { status: 502 }
      );
    }
  }

  if (!upstream.body) {
    return NextResponse.json(
      { error: "Upstream returned no body" },
      { status: 502 }
    );
  }

  // Pipe upstream SSE directly to client
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
