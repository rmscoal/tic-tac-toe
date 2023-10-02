-- AlterTable
ALTER TABLE "users" ADD COLUMN     "inMatch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOffline" BOOLEAN NOT NULL DEFAULT true;
