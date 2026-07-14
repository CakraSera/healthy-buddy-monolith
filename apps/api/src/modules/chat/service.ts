import { createCompletionStream } from "@anvia/core/completion";
import { createEventStream } from "@anvia/server";
import { z } from "zod";
import { prisma } from "../../utils/prisma.js";
import { getModel } from "../../utils/openai.js";

const COACH_PERSONA = `You are HealthBuddy, a warm, encouraging health coach for busy working professionals starting their health journey.

Rules:
- Keep replies short (2-4 sentences) and actionable.
- Only discuss sleep, basic nutrition, gentle movement, and stress.
- Never diagnose. Suggest seeing a doctor for anything medical or serious.`;

const ActionDecisionSchema = z.object({
  action: z.enum(["reply_directly", "log_checkin", "request_weekly_summary"]),
  reason: z.string(),
  checkin: z.object({
    sleep: z.number().min(1).max(5).nullable(),
    energy: z.number().min(1).max(5).nullable(),
    moved: z.boolean().nullable(),
    note: z.string().nullable(),
  }),
});

async function decideAction(userInput: string) {
  const decision = await createdParsedCompletion(getModel(), {
    instructions: `
      Decide the next action before answering the user.

      Use log_checkin when the user mentions how they slept, their energy
      level, or whether they exercised/moved today. Extract sleep and energy
      as 1-5 scores when mentioned.

      Use request_weekly_summary when the user asks for a recap, reflection,
      or summary of their week or progress.

      Use reply_directly for everything else.
      `,
    input: `User message: ${userInput}`,
    schema: ActionDecisionSchema,
  });

  return decision.data;
}

export async function getCoachResponse(userInput: string, sessionId: string) {
  await prisma.message.create({
    data: { sessionId, role: "user", content: userInput },
  });

  const history = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createAt: "desc" },
    take: 10,
  });

  const historyText = history
    .reverse()
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  const model = getModel();
  console.log("User Input:", userInput);
  const stream = createCompletionStream(model, {
    input: userInput,
  });
  return createEventStream(stream, {
    format: "jsonl",
  });
}
