import { generateId } from "../src/lib/id";
import { MATERIAL_LIMITS } from "../src/types/material";
import type { StoryMaterial } from "../src/types/material";
import type { StorySettings } from "../src/types/story";
import { analyzeAndGenerateResponseSchema } from "../src/services/ai/schemas";
import { generateJSON, GeminiCallError, delay } from "./_lib/geminiClient";
import { checkRateLimit, getClientKey } from "./_lib/rateLimit";
import {
  buildAnalyzeAndGeneratePrompt,
  buildAnalyzeAndGenerateSystemPrompt,
} from "./_lib/prompts";
import type { ApiHandler } from "./_lib/httpTypes";

interface RequestBody {
  materials: StoryMaterial[];
  settings: StorySettings;
}

function validateRequestBody(body: unknown): RequestBody | null {
  if (!body || typeof body !== "object") return null;
  const { materials, settings } = body as Record<string, unknown>;
  if (!Array.isArray(materials) || materials.length === 0) return null;
  if (materials.length > MATERIAL_LIMITS.maxMaterialCount) return null;
  const totalLength = materials.reduce(
    (sum: number, m) =>
      sum + (typeof (m as StoryMaterial)?.content === "string" ? (m as StoryMaterial).content.length : 0),
    0
  );
  if (totalLength > MATERIAL_LIMITS.maxTotalLength) return null;
  if (!settings || typeof settings !== "object") return null;
  return { materials: materials as StoryMaterial[], settings: settings as StorySettings };
}

async function callGeminiWithRetry(
  materials: StoryMaterial[],
  settings: StorySettings
) {
  const systemInstruction = buildAnalyzeAndGenerateSystemPrompt();
  const prompt = buildAnalyzeAndGeneratePrompt(materials, settings);

  const attempt = async (retryHint?: string) => {
    const raw = await generateJSON({
      systemInstruction,
      prompt: retryHint ? `${prompt}\n\n(참고: ${retryHint})` : prompt,
    });
    return analyzeAndGenerateResponseSchema.parse(raw);
  };

  try {
    return await attempt();
  } catch {
    // 1회 자동 재시도 (다른 프롬프트 문구로). 일시적 과부하(503) 등을 고려해 짧게 대기 후 재시도한다.
    await delay(1500);
    return await attempt(
      "이전 응답이 형식에 맞지 않았다. 반드시 지정된 JSON 스키마의 키와 타입을 정확히 지켜서 다시 응답하라."
    );
  }
}

const handler: ApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
    return;
  }

  const clientKey = getClientKey(req as unknown as { headers: Record<string, unknown> });
  if (!checkRateLimit(clientKey)) {
    res.status(429).json({
      error: "잠시 후 다시 시도해주세요. (요청이 너무 많습니다)",
    });
    return;
  }

  const parsed = validateRequestBody(req.body);
  if (!parsed) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }

  try {
    const result = await callGeminiWithRetry(parsed.materials, parsed.settings);
    const candidates = result.candidates.map((c) => ({
      ...c,
      id: c.id || generateId(),
    }));
    res.status(200).json({ analysis: result.analysis, candidates });
  } catch (err) {
    console.error("[analyze-and-generate]", err);
    const message =
      err instanceof GeminiCallError
        ? "스토리를 생성하지 못했습니다. 잠시 후 다시 시도해주세요."
        : "스토리를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    res.status(502).json({ error: message });
  }
};

export default handler;
