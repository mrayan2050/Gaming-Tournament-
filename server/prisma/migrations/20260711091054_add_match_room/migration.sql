-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "roomId" TEXT,
ADD COLUMN     "roomPassword" TEXT,
ADD COLUMN     "roomReleased" BOOLEAN NOT NULL DEFAULT false;
