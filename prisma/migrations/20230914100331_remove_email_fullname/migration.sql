/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_email_username_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "fullname";

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");
