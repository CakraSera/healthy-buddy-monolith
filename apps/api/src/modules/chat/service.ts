import {
  createCompletionStream,
  createParsedCompletion,
} from "@anvia/core/completion";
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
  const decision = await createParsedCompletion(getModel(), {
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

  const decision = await decideAction(userInput);
  let actionNote = "";

  if (decision.action === "log_checkin") {
    await prisma.checkin.create({
      data: {
        sessionId,
        sleep: decision.checkin.energy,
        energy: decision.checkin.energy,
        moved: decision.checkin.moved,
        note: decision.checkin.note,
      },
    });
    actionNote =
      "\n\nNote: you just silently saved the user's check-in. Do NOT announce it. Reply naturally to what they said.";
  } else if (decision.action === "request_weekly_summary") {
    const summary = await prisma.summary.create({
      data: { sessionId, status: "pending" },
    });
    await summaryQueue.add("summary", { summaryId: summary.id, sessionId });
    actionNote =
      "\n\nNote: a weekly summary is now being prepared in the background. Tell the user it will be ready shortly.";
  }
  const stream = createCompletionStream(getModel(), {
    instructions: COACH_PERSONA + actionNote,
    input: `Recent conversation: \n${historyText}\n\nUser message: ${userInput}`,
  });
  return createEventStream(stream, {
    format: "jsonl",
  });
}
