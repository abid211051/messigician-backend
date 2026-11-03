/*
  Warnings:

  - You are about to drop the `memberships` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,mess_id,sub_mess_id]` on the table `join_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_sub_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_user_id_fkey";

-- DropIndex
DROP INDEX "join_requests_user_id_idx";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mess_id" UUID,
ADD COLUMN     "mess_role" "mess_role",
ADD COLUMN     "monthly_rent" DECIMAL(10,2),
ADD COLUMN     "sub_mess_id" UUID;

-- DropTable
DROP TABLE "memberships";

-- DropEnum
DROP TYPE "membership_status";

-- CreateIndex
CREATE UNIQUE INDEX "join_requests_user_id_mess_id_sub_mess_id_key" ON "join_requests"("user_id", "mess_id", "sub_mess_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sub_mess_id_mess_id_fkey" FOREIGN KEY ("sub_mess_id", "mess_id") REFERENCES "sub_mess"("id", "mess_id") ON DELETE SET NULL ON UPDATE NO ACTION;
