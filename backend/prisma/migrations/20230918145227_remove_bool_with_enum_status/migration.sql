/*
  Warnings:

  - You are about to drop the column `inMatch` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isOffline` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'OFFLINE', 'IN_MATCH');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "inMatch",
DROP COLUMN "isOffline",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE';
