import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Vercel Node 런타임과 vite dev 미들웨어(vite.config.ts) 양쪽에서 동일하게 동작하도록 만든 최소 타입.
 * Vercel은 기본적으로 req.body를 파싱해주고 res.status/res.json을 제공하며,
 * dev 미들웨어에서도 동일한 동작을 흉내낸다.
 */
export interface ApiRequest extends IncomingMessage {
  body?: unknown;
}

export interface ApiResponse extends ServerResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void>;
