import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/ai/errors";

const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";
const GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const normalizeGeminiModel = (model: string) => model.replace(/^models\//, "");

const getOpenAIModels = async () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError("OPENAI_API_KEY is not configured.", 400);
  }

  const response = await fetch(OPENAI_MODELS_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage =
      (data as { error?: { message?: string } })?.error?.message ??
      "OpenAI model list failed.";
    throw new ApiError(errorMessage, response.status);
  }

  const models = (data as { data?: Array<{ id: string }> }).data ?? [];

  return models
    .map((model) => ({ id: model.id }))
    .filter((model) => model.id.startsWith("gpt-"))
    .sort((a, b) => a.id.localeCompare(b.id));
};

const getGeminiModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError("GEMINI_API_KEY is not configured.", 400);
  }

  const response = await fetch(`${GEMINI_MODELS_URL}?key=${apiKey}`);
  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      (data as { error?: { message?: string } })?.error?.message ??
      "Gemini model list failed.";
    throw new ApiError(errorMessage, response.status);
  }

  const models =
    (data as {
      models?: Array<{
        name: string;
        displayName?: string;
        supportedGenerationMethods?: string[];
      }>;
    }).models ?? [];

  return models
    .filter((model) =>
      model.supportedGenerationMethods?.includes("generateContent")
    )
    .map((model) => ({
      id: normalizeGeminiModel(model.name),
      label: model.displayName,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
};

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");

  try {
    if (provider === "openai" || provider === "claude") {
      const models = await getOpenAIModels();
      return NextResponse.json({ models });
    }

    if (provider === "gemini") {
      const models = await getGeminiModels();
      return NextResponse.json({ models });
    }

    const [openai, gemini] = await Promise.all([getOpenAIModels(), getGeminiModels()]);
    return NextResponse.json({ openai, gemini });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = "nodejs";
