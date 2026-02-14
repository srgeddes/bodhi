import { Agent } from "undici";

const TELLER_API_BASE = "https://api.teller.io";

function createTellerAgent(): Agent | undefined {
  const cert = process.env.TELLER_CERTIFICATE?.replace(/\\n/g, "\n");
  const key = process.env.TELLER_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!cert || !key) {
    // Sandbox mode doesn't require mTLS
    return undefined;
  }

  return new Agent({
    connect: { cert, key },
  });
}

const globalForTeller = globalThis as unknown as {
  tellerAgent: Agent | undefined;
  tellerAgentInitialized: boolean;
};

if (!globalForTeller.tellerAgentInitialized) {
  globalForTeller.tellerAgent = createTellerAgent();
  globalForTeller.tellerAgentInitialized = true;
}

const tellerAgent = globalForTeller.tellerAgent;

export async function tellerFetch<T>(
  path: string,
  accessToken: string,
  options?: { method?: string; body?: unknown }
): Promise<T> {
  const url = `${TELLER_API_BASE}${path}`;
  const method = options?.method ?? "GET";

  const headers: Record<string, string> = {
    Authorization: `Basic ${Buffer.from(`${accessToken}:`).toString("base64")}`,
    "Content-Type": "application/json",
  };

  const fetchOptions: RequestInit & { dispatcher?: Agent } = {
    method,
    headers,
    ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
    ...(tellerAgent ? { dispatcher: tellerAgent } : {}),
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage: string;
    let errorCode: string;
    try {
      const parsed = JSON.parse(errorBody);
      errorMessage = parsed.error?.message ?? `Teller API error: ${response.status}`;
      errorCode = parsed.error?.code ?? "UNKNOWN";
    } catch {
      errorMessage = `Teller API error: ${response.status}`;
      errorCode = "UNKNOWN";
    }
    throw { message: errorMessage, code: errorCode, status: response.status };
  }

  return response.json() as Promise<T>;
}
