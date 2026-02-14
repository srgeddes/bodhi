import OpenAI from "openai";

let client: OpenAI | null = null;

export const AI_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1:8b";

export function getAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
      apiKey: "ollama",
    });
  }
  return client;
}
