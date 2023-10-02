/*
  Warnings:

  - You are about to drop the `MatchInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_matchInvitationId_fkey";

-- DropTable
DROP TABLE "MatchInvitation";

-- CreateTable
CREATE TABLE "match_invitations" (
    "id" SERIAL NOT NULL,
    "challengerId" INTEGER NOT NULL,
    "challengedId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "MatchInvitationStatus" NOT NULL,

    CONSTRAINT "match_invitations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_matchInvitationId_fkey" FOREIGN KEY ("matchInvitationId") REFERENCES "match_invitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
