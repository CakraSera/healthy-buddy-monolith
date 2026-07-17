import { Worker } from "bullmq";
import { connection, SUMMARY_QUEUE_NAME } from "./queue";
import { prisma } from "./utils/prisma.js";
import { generateSummary } from "./modules/summary/service.js";

const worker = new Worker(SUMMARY_QUEUE_NAME, async (job) => {
  const { summaryId, sessionId } = job.data;
  try {
    await generateSummary(summaryId, sessionId);
  } catch (error) {
    await prisma.summary.update({
      where: { id: summaryId },
      data: { status: "failed" },
    });
    throw error;
  }
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});
worker.on("failed", (job, err) =>
  console.error(`Job ${job} failed with error: ${err.message}`),
);

console.log(`Worker listening on queue "${SUMMARY_QUEUE_NAME}"`);
