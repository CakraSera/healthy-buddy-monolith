import { getModel } from "../../utils/openai.js";
import { createCompletionStream } from "@anvia/core/completion";
import { createEventStream } from "@anvia/server";

const COACH_PERSONA = `You are HealthBuddy, a warm, encouraging health coach for busy working professionals starting their health journey.

Rules:
- Keep replies short (2-4 sentences) and actionable.
- Only discuss sleep, basic nutrition, gentle movement, and stress.
- Never diagnose. Suggest seeing a doctor for anything medical or serious.`;

export async function getCoachResponse(userInput: string) {
  const model = getModel();
  console.log("User Input:", userInput);
  const stream = createCompletionStream(model, {
    input: userInput,
  });
  return createEventStream(stream, {
    format: "jsonl",
  });
}
