import { createCompletion } from "@anvia/core";
import { getModel } from "../../utils/openai.ts";
import { prisma } from "../../utils/prisma.ts";

export async function generateSummary(summaryId: string, sessionId: string) {
  await prisma.summary.update({
    where: { id: summaryId },
    data: { status: "processing" },
  });

  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createAt: "asc" },
  });

  const transcript = messages.length
    ? messages
        .map((message) => `${message.role}: ${message.content}`)
        .join("\n")
    : "No conversation yet.";

  const result = await createCompletion(getModel(), {
    instructions: `
        You are HealtBuddy. 
        Read this user's conversation history and write a short, warm weekly reflection (4-6 sentences): 
          one thing they're doing well , one gentle suggestion for next week, and an encouraging closing line. 
          Be specific to what they discussed.`,
    input: transcript,
  });
}
