/*
  Warnings:

  - A unique constraint covering the columns `[matchInvitationId]` on the table `matches` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matchInvitationId` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchInvitationStatus" AS ENUM ('ACCEPTED', 'REJECTED', 'EXPIRED', 'PENDING');

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "matchInvitationId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "MatchInvitation" (
    "id" SERIAL NOT NULL,
    "challengerId" INTEGER NOT NULL,
    "challengedId" INTEGER NOT NULL,
    "status" "MatchInvitationStatus" NOT NULL,

    CONSTRAINT "MatchInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "matches_matchInvitationId_key" ON "matches"("matchInvitationId");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_matchInvitationId_fkey" FOREIGN KEY ("matchInvitationId") REFERENCES "MatchInvitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
