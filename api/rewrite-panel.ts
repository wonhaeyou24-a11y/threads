import type { StoryCandidate } from "../src/types/story";
import type { StoryboardPanel } from "../src/types/storyboard";
import { rewritePanelResponseSchema } from "./_lib/schemas.js";
import { generateJSON, GeminiCallError, delay } from "./_lib/geminiClient.js";
import { checkRateLimit, getClientKey } from "./_lib/rateLimit.js";
import {
  buildPanelRewritePrompt,
  buildPanelRewriteSystemPrompt,
} from "./_lib/prompts.js";
import type { ApiHandler } from "./_lib/httpTypes";

const MAX_REQUEST_LENGTH = 500;

interface RequestBody {
  candidate: StoryCandidate;
  panels: StoryboardPanel[];
  targetPanelId: string;
  userRequest: string;
}

function validateRequestBody(body: unknown): RequestBody | null {
  if (!body || typeof body !== "object") return null;
  const { candidate, panels, targetPanelId, userRequest } = body as Record<
    string,
    unknown
  >;
  if (!candidate || typeof candidate !== "object") return null;
  if (!Array.isArray(panels) || panels.length === 0) return null;
  if (typeof targetPanelId !== "string" || !targetPanelId) return null;
  if (
    typeof userRequest !== "string" ||
    userRequest.trim().length === 0 ||
    userRequest.length > MAX_REQUEST_LENGTH
  ) {
    return null;
  }
  return {
    candidate: candidate as StoryCandidate,
    panels: panels as StoryboardPanel[],
    targetPanelId,
    userRequest,
  };
}

async function callGeminiWithRetry(
  candidate: StoryCandidate,
  prevPanel: StoryboardPanel | undefined,
  targetPanel: StoryboardPanel,
  nextPanel: StoryboardPanel | undefined,
  userRequest: string
) {
  const systemInstruction = buildPanelRewriteSystemPrompt();
  const prompt = buildPanelRewritePrompt(
    candidate,
    prevPanel,
    targetPanel,
    nextPanel,
    userRequest
  );

  const attempt = async (retryHint?: string) => {
    const raw = await generateJSON({
      systemInstruction,
      prompt: retryHint ? `${prompt}\n\n(참고: ${retryHint})` : prompt,
    });
    return rewritePanelResponseSchema.parse(raw);
  };

  try {
    return await attempt();
  } catch {
    await delay(1500);
    return await attempt(
      `이전 응답이 형식에 맞지 않았다. id는 "${targetPanel.id}", panelNumber는 ${targetPanel.panelNumber}를 유지하며 지정된 JSON 스키마로 다시 응답하라.`
    );
  }
}

const handler: ApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
    return;
  }

  const clientKey = getClientKey(
    req as unknown as { headers: Record<string, unknown> }
  );
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

  const index = parsed.panels.findIndex((p) => p.id === parsed.targetPanelId);
  if (index === -1) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const targetPanel = parsed.panels[index];
  const prevPanel = index > 0 ? parsed.panels[index - 1] : undefined;
  const nextPanel =
    index < parsed.panels.length - 1 ? parsed.panels[index + 1] : undefined;

  try {
    const result = await callGeminiWithRetry(
      parsed.candidate,
      prevPanel,
      targetPanel,
      nextPanel,
      parsed.userRequest
    );
    res.status(200).json({
      panel: {
        ...result.panel,
        id: targetPanel.id,
        panelNumber: targetPanel.panelNumber,
        imagePrompt: "",
      },
    });
  } catch (err) {
    console.error("[rewrite-panel]", err);
    const message =
      err instanceof GeminiCallError
        ? "컷을 다시 작성하지 못했습니다. 잠시 후 다시 시도해주세요."
        : "컷을 다시 작성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    res.status(502).json({ error: message });
  }
};

export default handler;
