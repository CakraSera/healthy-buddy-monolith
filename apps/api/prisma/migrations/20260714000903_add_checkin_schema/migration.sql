-- CreateTable
CREATE TABLE "checkins" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "sleep" INTEGER,
    "energy" INTEGER,
    "moved" BOOLEAN,
    "note" TEXT,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checkins_session_id_create_at_idx" ON "checkins"("session_id", "create_at");
