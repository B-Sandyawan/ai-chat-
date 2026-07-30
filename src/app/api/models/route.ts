import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.AMANAI_API_KEY;
  const baseUrl = process.env.AMANAI_API_BASE_URL || "https://api.amanai.dev/v1";

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Models API error:", response.status, errorText);
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter to chat-capable models and format
    const models = (data.data || data || [])
      .filter((m: any) => {
        const id: string = m.id || "";
        const isChatModel =
          /claude|gpt|grok|deepseek|kimi|gemini|glm|hy3/i.test(id);
        const notImageOnly = !/imagine|image|dall|flux|sdxl/i.test(id);
        return isChatModel && notImageOnly;
      })
      .map((m: any) => {
        const id: string = m.id;
        const name = id
          .replace("amanai/", "")
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return {
          id,
          name,
          description: m.description || "",
          contextWindow: m.context_window || m.context_length || 200000,
          priority: /opus/.test(id) ? 1 : /sonnet|gpt-5/.test(id) ? 2 : 3,
          supportsVision:
            m.input_modalities?.includes("image") || /claude|gpt|grok/.test(id),
          supportsReasoning: true,
        };
      })
      .sort((a: any, b: any) => a.priority - b.priority);

    return NextResponse.json({ data: models });
  } catch (error: any) {
    console.error("Models route error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
